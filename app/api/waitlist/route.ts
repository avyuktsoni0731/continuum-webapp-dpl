import { NextResponse } from "next/server";
import { addToWaitlist, checkEmailExists } from "@/lib/google-sheets";
import { sendConfirmationEmail, sendAdminNotification } from "@/lib/gmail-smtp";

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

    // Send confirmation email to the user using Gmail SMTP
    await sendConfirmationEmail(email);

    // Send notification to yourself (admin)
    await sendAdminNotification(email);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully joined the waitlist!",
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
