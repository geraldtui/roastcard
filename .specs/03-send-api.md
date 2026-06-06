# Spec: Send API Route

**Status:** Verified
**Parent:** `ROASTCARD_SPEC.md` (§4, §7, §8, §10)
**Last updated:** 2026-06-06

## User Story

As a sender, I want a server endpoint that validates my input and emails a roast card via Resend, so that the secret API key stays server-side and the card reaches the recipient.

## Context

**Why:** A single serverless route holds the Resend secret and performs the send (`ROASTCARD_SPEC.md` §2, §7). It validates input, drops honeypot submissions, picks a roast, renders the card, and sends with a fixed verified-domain From plus the sender's email as Reply-To. The sender is also silently copied (BCC) so both sender and recipient witness the roast reveal.

**Related:**
- `01-roast-content.md` (`getRandomRoast`)
- `02-email-card-template.md` (rendered to HTML)
- `04-send-form-ui.md` (the client caller)

**Dependencies:** `resend`, `@react-email/components` (`render`), env vars `RESEND_API_KEY`, `FROM_EMAIL`.

## Technical Specification

**API:**
- NEW `POST /api/send` — `app/api/send/route.ts` (Node runtime).

**Request body (JSON):** `{ recipientName, recipientEmail, senderName, senderEmail, company }` where `company` is the honeypot.

**Modules:**
- NEW `lib/validation.ts` — `isEmail(value)` basic format check + a `validateSendPayload(body)` returning typed result/errors.

**Behavior (per §7):**
1. If honeypot `company` is non-empty → return `200 { ok: true }` and do nothing (silent drop).
2. Validate all four fields present + recipient/sender email formats → on failure `400 { ok: false, error }`.
3. Pick random roast (interpolated) + render `RoastCard` to HTML.
4. Send via Resend: `from` = `"{senderName} via RoastCard <FROM_EMAIL>"`, `to` = recipient email, `bcc` = sender email (so the sender gets a copy of the reveal without the recipient seeing it), `replyTo` = sender email, `subject` = `"🎂 Happy Birthday, {recipientName}!"`, `html` = rendered card.
5. On success → `200 { ok: true }`. On Resend failure → `500 { ok: false, error }` (safe message).

**Mock mode:** If `RESEND_API_KEY` is unset, skip the real Resend call, log the would-be email server-side (including `bcc`), and return `200 { ok: true, mocked: true }` so the flow is testable locally.

## Acceptance Criteria

- [ ] **AC1**: Valid payload sends and returns ok.
  - Given a valid JSON body and a configured (or mock) sender
  - When `POST /api/send` is called
  - Then it returns `200 { ok: true }`

- [ ] **AC2**: Honeypot is silently dropped.
  - Given a body with non-empty `company`
  - When posted
  - Then it returns `200` and no email is sent

- [ ] **AC3**: Invalid input is rejected.
  - Given a missing field or malformed email
  - When posted
  - Then it returns `400 { ok: false, error }` and no email is sent

- [ ] **AC4**: From/Reply-To/BCC identity is correct.
  - Given a valid send
  - When the Resend call is built
  - Then `from` uses the fixed `FROM_EMAIL` with sender display name, `replyTo` is the sender's typed email, and `bcc` is the sender's typed email (so the sender receives a copy)

- [ ] **AC5**: Mock mode works without a key.
  - Given `RESEND_API_KEY` is unset
  - When a valid body is posted
  - Then it returns `200 { ok: true, mocked: true }` and logs instead of sending

- [ ] **AC6**: Send failure is handled safely.
  - Given Resend returns an error
  - When sending
  - Then the route returns `500 { ok: false, error }` without leaking internals

## Changelog

- **2026-06-06** — Added sender BCC: the sender's email is now BCC'd on the card
  so both sender and recipient see the roast reveal. Updated send behavior (step
  4), mock-mode logging, and AC4. (Status: Verified → Approved → Verified)
