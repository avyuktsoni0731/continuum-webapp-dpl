import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import { WaitlistConfirmationEmail } from "@/emails/waitlist-confirmation";

// Create transporter for Gmail
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

export async function sendConfirmationEmail(email: string) {
  try {
    const transporter = createTransporter();

    // Render the React email to HTML (await the promise)
    const emailHtml = await render(WaitlistConfirmationEmail({ email }));

    // Send confirmation email to user
    await transporter.sendMail({
      from: `"Avyukt@Continuum" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Welcome to the Continuum Waitlist! 🎉",
      html: emailHtml,
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    throw error;
  }
}

export async function sendAdminNotification(email: string) {
  try {
    const transporter = createTransporter();

    // Send notification to admin
    await transporter.sendMail({
      from: `"Continuum Waitlist" <${process.env.GMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.GMAIL_USER,
      subject: `New Waitlist Signup: ${email}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: #ff6b35;">🎉 New Waitlist Signup!</h2>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #666; font-size: 14px;">
            This notification was sent from your Continuum waitlist form.
          </p>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending admin notification:", error);
    // Don't throw - admin notification is not critical
    return { success: false };
  }
}
