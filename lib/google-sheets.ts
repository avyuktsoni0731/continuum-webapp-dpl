import { google } from "googleapis";

export async function addToWaitlist(email: string) {
  try {
    // Parse the service account credentials from environment variable
    const credentials = JSON.parse(
      process.env.GOOGLE_SERVICE_ACCOUNT_KEY || "{}"
    );

    // Create auth client
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!spreadsheetId) {
      throw new Error("GOOGLE_SHEET_ID not configured");
    }

    // Get current timestamp
    const timestamp = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata", // Changed to India timezone
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    // Append the email and timestamp to the sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Sheet1!A:B", // Sheet name and columns
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[email, timestamp]],
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error adding to Google Sheets:", error);
    throw error;
  }
}

// Optional: Check if email already exists in the sheet
export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const credentials = JSON.parse(
      process.env.GOOGLE_SERVICE_ACCOUNT_KEY || "{}"
    );

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!spreadsheetId) {
      return false;
    }

    // Get all emails from column A
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Sheet1!A:A",
    });

    const emails = response.data.values?.flat() || [];
    return emails.includes(email);
  } catch (error) {
    console.error("Error checking email in Google Sheets:", error);
    return false;
  }
}
