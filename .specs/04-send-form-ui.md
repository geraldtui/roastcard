# Spec: Send Form UI

**Status:** Verified
**Parent:** `ROASTCARD_SPEC.md` (§6)
**Last updated:** 2026-06-06

## User Story

As a sender, I want a minimal single-page form to enter recipient and sender details and hit Send, so that I can email a roast card in seconds with clear feedback.

## Context

**Why:** The UI is four inputs + a Send button, sleek and minimal (`ROASTCARD_SPEC.md` §6). Feedback is inline on the same page (no redirect). Includes a hidden honeypot and client-side validation.

**Related:**
- `03-send-api.md` (the endpoint this form posts to)

**Dependencies:** Tailwind CSS (already configured), `app/page.tsx`, `app/layout.tsx` metadata.

## Technical Specification

**Components:**
- MODIFIED `app/page.tsx` — replace scaffold with the RoastCard form (client component).
- MODIFIED `app/layout.tsx` — update `metadata` title/description to RoastCard branding.
- MODIFIED `app/globals.css` — minimal theme tweaks if needed.

**State/Configuration:**
- Form state: `recipientName`, `recipientEmail`, `senderName`, `senderEmail` (strings), `company` (honeypot string).
- UI state: `status: "idle" | "submitting" | "success" | "error"`, `errorMessage: string`.

**Behavior (per §6):**
- Four labeled, stacked inputs with placeholders + a visually-hidden honeypot (`aria-hidden`, `tabindex=-1`, off-screen).
- Client validation: all four required; recipient/sender emails match basic format. Send disabled while submitting.
- On submit: POST JSON to `/api/send`. While in flight → button shows loading/disabled.
- Success → inline "Card sent! 🎉" message + reset form fields.
- Error (validation or send failure) → inline error message; entered values preserved.

## Acceptance Criteria

- [ ] **AC1**: Form renders four inputs + Send.
  - Given the home page
  - When loaded
  - Then Recipient Name, Recipient Email, Sender Name, Sender Email inputs and a Send button are visible, plus a visually-hidden honeypot

- [ ] **AC2**: Client validation blocks bad input.
  - Given a missing field or invalid email
  - When Send is clicked
  - Then an inline error shows and no request is sent

- [ ] **AC3**: Submitting state disables the button.
  - Given a valid submission in flight
  - When awaiting the response
  - Then the Send button is disabled and shows a loading state

- [ ] **AC4**: Success resets the form with confirmation.
  - Given the API returns `{ ok: true }`
  - When the response arrives
  - Then an inline "Card sent! 🎉" message shows and the fields reset

- [ ] **AC5**: Error preserves entered values.
  - Given the API returns an error
  - When the response arrives
  - Then an inline error message shows and the entered values remain

- [ ] **AC6**: UI is minimal and centered.
  - Given the page
  - When viewed
  - Then it shows RoastCard branding with a single centered card layout and no extraneous content
