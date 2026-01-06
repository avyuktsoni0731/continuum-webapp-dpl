import { NextResponse } from "next/server";
import { Resend } from "resend";
import { WaitlistConfirmationEmail } from "@/emails/waitlist-confirmation";
import { addToWaitlist, checkEmailExists } from "@/lib/google-sheets";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Check if email already exists in the waitlist
    const emailExists = await checkEmailExists(email);
    if (emailExists) {
      return NextResponse.json(
        { error: "This email is already on the waitlist!" },
        { status: 400 }
      );
    }

    // Add email to Google Sheets
    await addToWaitlist(email);

    // Send confirmation email to the user
    const { data: confirmationData, error: confirmationError } =
      await resend.emails.send({
        from:
          process.env.FROM_EMAIL || "Avyukt@Continuum <onboarding@resend.dev>",
        to: [email],
        subject: "Welcome to the Continuum Waitlist! 🎉",
        react: WaitlistConfirmationEmail({ email }),
      });

    if (confirmationError) {
      console.error("Error sending confirmation email:", confirmationError);
      return NextResponse.json(
        { error: "Failed to send confirmation email" },
        { status: 500 }
      );
    }

    // Send notification to yourself (admin)
    const { data: notificationData, error: notificationError } =
      await resend.emails.send({
        from: process.env.FROM_EMAIL || "Continuum <onboarding@resend.dev>",
        to: [process.env.ADMIN_EMAIL || "your-email@example.com"],
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

    if (notificationError) {
      console.error("Error sending admin notification:", notificationError);
      // Don't fail the request if admin notification fails
    }

    return NextResponse.json(
      {
        success: true,
        message: "Successfully joined the waitlist!",
        confirmationId: confirmationData?.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Waitlist API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
