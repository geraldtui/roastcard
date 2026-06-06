import { NextResponse } from "next/server";
import { render } from "@react-email/components";
import { Resend } from "resend";
import RoastCard from "@/emails/RoastCard";
import { getRandomRoast } from "@/lib/roasts";
import { validateSendPayload } from "@/lib/validation";

export const runtime = "nodejs";

const FROM_EMAIL = process.env.FROM_EMAIL ?? "cards@roastcard.geraldtui.com";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const result = validateSendPayload(body);

  // Honeypot: a real user never fills `company`. Silently drop bots without
  // tipping them off (the validation result is intentionally ignored here).
  const honeypot = (body as { company?: unknown })?.company;
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }

  const { recipientName, recipientEmail, senderName, senderEmail } = result.data;
  const roast = getRandomRoast(recipientName);

  const html = await render(
    RoastCard({ recipientName, senderName, roast }),
  );

  const from = `${senderName} via RoastCard <${FROM_EMAIL}>`;
  const subject = `🎂 Happy Birthday, ${recipientName}!`;

  const apiKey = process.env.RESEND_API_KEY;

  // Mock mode: without a key we cannot send, so log the would-be email and
  // succeed so the flow is fully testable locally.
  if (!apiKey) {
    console.log("[RoastCard mock send]", {
      from,
      to: recipientEmail,
      bcc: senderEmail,
      replyTo: senderEmail,
      subject,
    });
    return NextResponse.json({ ok: true, mocked: true });
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: recipientEmail,
      bcc: senderEmail,
      replyTo: senderEmail,
      subject,
      html,
    });

    if (error) {
      console.error("[RoastCard] Resend error:", error);
      return NextResponse.json(
        { ok: false, error: "Could not send the card. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[RoastCard] Send failed:", err);
    return NextResponse.json(
      { ok: false, error: "Could not send the card. Please try again." },
      { status: 500 },
    );
  }
}
