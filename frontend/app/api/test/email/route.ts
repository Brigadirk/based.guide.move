import { NextResponse } from "next/server";
import { ServerClient, Models } from "postmark";

export async function POST() {
  try {
    const token = process.env.POSTMARK_SERVER_TOKEN;
    const senderEmail = process.env.POSTMARK_SENDER_EMAIL;

    if (!token) {
      throw new Error("POSTMARK_SERVER_TOKEN is not set");
    }
    if (!senderEmail) {
      throw new Error("POSTMARK_SENDER_EMAIL is not set");
    }

    const client = new ServerClient(token);
    const testId = Date.now().toString();

    // Test various broadcast configurations
    const results = await Promise.all([
      // 1. Basic broadcast with minimal config
      client.sendEmail({
        From: senderEmail,
        To: "amaro+test@amarokoberle.com",
        Subject: `Test ${testId} - Basic Broadcast`,
        TextBody: "Basic broadcast test",
        MessageStream: "broadcast"
      }),

      // 2. Broadcast with HTML, tracking, and unsubscribe
      client.sendEmail({
        From: senderEmail,
        To: "amaro+test@amarokoberle.com",
        Subject: `Test ${testId} - Full Broadcast`,
        HtmlBody: `
          <html>
            <body>
              <h1>Full Broadcast Test</h1>
              <p>Testing with all broadcast features at ${new Date().toISOString()}</p>
              <p><a href="https://based.guide">Test Link</a></p>
              <p><a href="https://subscriptions.pstmk.it/demo/unsubscribe">Unsubscribe</a></p>
            </body>
          </html>
        `,
        TextBody: "Full broadcast test with tracking and unsubscribe",
        MessageStream: "broadcast",
        TrackOpens: true,
        TrackLinks: Models.LinkTrackingOptions.HtmlAndText
      }),

      // 3. Broadcast with custom headers
      client.sendEmail({
        From: senderEmail,
        To: "amaro+test@amarokoberle.com",
        Subject: `Test ${testId} - Headers Broadcast`,
        TextBody: "Testing with custom headers",
        MessageStream: "broadcast",
        Headers: [
          {
            Name: "X-PM-Message-Stream",
            Value: "broadcast"
          },
          {
            Name: "List-Unsubscribe",
            Value: "<https://subscriptions.pstmk.it/demo/unsubscribe>"
          }
        ]
      }),

      // 4. Broadcast with metadata
      client.sendEmail({
        From: senderEmail,
        To: "amaro+test@amarokoberle.com",
        Subject: `Test ${testId} - Metadata Broadcast`,
        TextBody: "Testing with metadata",
        MessageStream: "broadcast",
        Metadata: {
          test_id: testId,
          test_type: "broadcast",
          test_variant: "metadata"
        }
      }),

      // 5. Broadcast with different From format
      client.sendEmail({
        From: `"Based Guide" <${senderEmail}>`,
        To: "amaro+test@amarokoberle.com",
        Subject: `Test ${testId} - From Format Broadcast`,
        TextBody: "Testing with formatted From address",
        MessageStream: "broadcast"
      })
    ]);

    return NextResponse.json({
      success: true,
      testId,
      results: {
        basic: results[0],
        full: results[1],
        headers: results[2],
        metadata: results[3],
        fromFormat: results[4]
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("[TEST_EMAIL] Error:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 