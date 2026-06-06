export interface SendPayload {
  recipientName: string;
  recipientEmail: string;
  senderName: string;
  senderEmail: string;
  company: string;
}

export type ValidationResult =
  | { ok: true; data: SendPayload }
  | { ok: false; error: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function validateSendPayload(body: unknown): ValidationResult {
  const raw = (body ?? {}) as Record<string, unknown>;

  const data: SendPayload = {
    recipientName: asString(raw.recipientName),
    recipientEmail: asString(raw.recipientEmail),
    senderName: asString(raw.senderName),
    senderEmail: asString(raw.senderEmail),
    company: asString(raw.company),
  };

  if (!data.recipientName || !data.senderName) {
    return { ok: false, error: "Both names are required." };
  }
  if (!isEmail(data.recipientEmail)) {
    return { ok: false, error: "Please enter a valid recipient email." };
  }
  if (!isEmail(data.senderEmail)) {
    return { ok: false, error: "Please enter a valid sender email." };
  }

  return { ok: true, data };
}
