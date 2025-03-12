import { NextResponse } from "next/server"
import { ServerClient } from "postmark"

// Track pending emails locally since Postmark queue is unreliable
const pendingEmails = new Map<string, {
  messageId: string,
  timestamp: number,
  attempts: number
}>();

// Clean up old pending emails periodically
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of pendingEmails.entries()) {
    if (now - data.timestamp > 5 * 60 * 1000) { // 5 minutes
      pendingEmails.delete(email);
    }
  }
}, 60 * 1000); // Clean up every minute

export async function POST(request: Request) {
  try {
    // Check for required environment variables
    if (!process.env.POSTMARK_SERVER_TOKEN) {
      throw new Error("POSTMARK_SERVER_TOKEN is not set");
    }
    if (!process.env.POSTMARK_SENDER_EMAIL) {
      throw new Error("POSTMARK_SENDER_EMAIL is not set");
    }
    if (!process.env.NEXTAUTH_URL) {
      throw new Error("NEXTAUTH_URL is not set");
    }

    const client = new ServerClient(process.env.POSTMARK_SERVER_TOKEN);
    const senderEmail = process.env.POSTMARK_SENDER_EMAIL;

    // Get the email from the request
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Check if we already have a pending verification for this email
    const pending = pendingEmails.get(email);
    if (pending) {
      const timeSinceLastAttempt = Date.now() - pending.timestamp;
      if (timeSinceLastAttempt < 60 * 1000) { // 1 minute
        return NextResponse.json({
          message: "Please wait before requesting another verification email",
          retryAfter: Math.ceil((60 * 1000 - timeSinceLastAttempt) / 1000)
        }, { status: 429 });
      }
    }

    // First, try sending a test email to blackhole
    try {
      console.log("[AUTH_RESEND] Sending test email to blackhole...");
      const testResult = await client.sendEmail({
        From: senderEmail,
        To: "test@blackhole.postmarkapp.com",
        Subject: "Test Email",
        TextBody: "Testing Postmark setup",
        MessageStream: "outbound",
        Headers: [
          {
            Name: "X-Test-Header",
            Value: "true"
          }
        ]
      });

      console.log("[AUTH_RESEND] Test email response:", testResult);
    } catch (error) {
      console.error("[AUTH_RESEND] Test email failed:", error);
    }

    // Generate verification token and URL
    const token = crypto.randomUUID();
    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;

    // Send the verification email
    try {
      console.log("[AUTH_RESEND] Attempting to send verification email to:", email);
      
      const messageData = {
        From: senderEmail,
        To: email,
        Subject: "Based Guide - Please Verify Your Email",
        TextBody: `Welcome to Based Guide! Please verify your email by visiting: ${verificationUrl}`,
        HtmlBody: `
          <h2>Welcome to Based Guide</h2>
          <p>Please verify your email address by clicking the link below:</p>
          <p><a href="${verificationUrl}">Click here to verify your email</a></p>
          <p>Link expires in 24 hours.</p>
          <p>If you did not sign up for Based Guide, please ignore this email.</p>
        `,
        MessageStream: "outbound",
        Tag: "verification",
        Headers: [
          {
            Name: "X-Entity-Ref-ID",
            Value: token
          },
          {
            Name: "X-PM-Message-Stream",
            Value: "outbound"
          }
        ]
      };

      console.log("[AUTH_RESEND] Sending email with data:", {
        From: messageData.From,
        To: messageData.To,
        Subject: messageData.Subject,
        MessageStream: messageData.MessageStream,
        Tag: messageData.Tag,
        Headers: messageData.Headers
      });

      const result = await client.sendEmail(messageData);

      if (!result || !result.MessageID) {
        throw new Error("No MessageID received from Postmark");
      }

      console.log("[AUTH_RESEND] Raw Postmark response:", result);

      // Store the pending verification
      pendingEmails.set(email, {
        messageId: result.MessageID,
        timestamp: Date.now(),
        attempts: (pending?.attempts || 0) + 1
      });

      console.log("[AUTH_RESEND] Email queued with MessageID:", result.MessageID);
      
      return NextResponse.json({
        message: "⚠️ Verification email queued for delivery. Due to technical issues with our email provider, delivery may be delayed. If you don't receive the email within 5 minutes, please try again or contact support.",
        messageId: result.MessageID,
        status: "QUEUED",
        queueTime: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("[AUTH_RESEND] Error sending email:", error);
      return NextResponse.json(
        {
          error: "Failed to send verification email",
          details: "Our email service is experiencing technical difficulties. Please try again later or contact support.",
          technicalDetails: error.message || "Unknown error occurred"
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("[AUTH_RESEND] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: "An unexpected error occurred while processing your request",
        technicalDetails: error.message || "Unknown error"
      },
      { status: 500 }
    );
  }
} 