# RoastCard — Technical Spec

> A web app that sends a virtual birthday card to a friend by email. The card
> contains a short, randomly chosen message that playfully roasts the recipient.

**Status:** MVP design, agreed via grilling session.
**Author:** Gerald
**Last updated:** 2026-06-06

---

## 1. Summary & Goals

RoastCard lets anyone fill in a tiny form (recipient + sender details) and email
a good-looking birthday card containing a random, affectionate roast of the
recipient. The product priorities, in order:

1. **Free to run.** Stay within free tiers (Vercel + Resend).
2. **Minimal, sleek UI.** Four inputs and a Send button. Nothing else.
3. **Fun.** The roast is the payload; it should land well in real inboxes.

### Non-goals (MVP)

- No accounts, login, or persistence/history of sent cards.
- No scheduling ("send on their birthday").
- No card customization (themes, images, colors chosen by user).
- No AI-generated roasts (designed to be addable later — see §9).
- No preview/shuffle of the roast (it's a surprise — see §9).

---

## 2. Architecture Overview

A "mostly static" Next.js app with a single serverless function for sending.

```
Browser (static page, form)
        │  POST /api/send  (JSON)
        ▼
Next.js Route Handler (serverless on Vercel)
        │  - validate input
        │  - pick random roast
        │  - render React Email card
        ▼
Resend API  ──►  Recipient's inbox
```

### Why not 100% static?

A truly static site (`output: export`, CDN only) cannot send email: doing so
requires a **secret API key** that must never be exposed in client-side code.
Therefore we keep **one** serverless API route to hold the secret and call
Resend. Everything else is static and the app still deploys free on Vercel.

**Decision:** Next.js on the Vercel free tier with a single `/api/send` route.
**Trade-off considered & rejected:** a pure-static site calling a third-party
client SDK (e.g. EmailJS). Rejected because it exposes a public key, ties us to
that vendor, and offers weaker control over the email itself.

---

## 3. Tech Stack

| Concern        | Choice                          | Why |
|----------------|---------------------------------|-----|
| Framework      | Next.js (App Router) + TypeScript | Latest conventions, type safety, free Vercel deploy |
| Styling        | Tailwind CSS                    | Fast path to a clean, minimal, sleek UI |
| Email delivery | Resend                          | Generous free tier (~3k emails/mo), great DX, React Email support |
| Email template | React Email                     | Designed HTML card that renders reliably across inboxes |
| Hosting        | Vercel (free / Hobby tier)      | Zero-config Next.js, free serverless functions |

---

## 4. The Send Flow & Email Identity

### 4.1 Form → email field mapping

The form has exactly four user-visible inputs plus a hidden honeypot:

| Form field        | Used as |
|-------------------|---------|
| Recipient Name    | Greeting in the card body + roast target + `To` display name |
| Recipient Email   | The `To` address |
| Sender Name       | Shown in the card ("from {Sender Name}") + the From **display name** |
| Sender Email      | The `Reply-To` address **only** |
| (hidden) honeypot | Spam trap; if filled, silently drop the request |

### 4.2 From address — important constraint

You **cannot** truly send email "from" an address you don't control; doing so
fails SPF/DKIM/DMARC checks and lands in spam or is rejected.

**Decision:** Always send from a **fixed, verified-domain address**, e.g.
`RoastCard <cards@yourdomain.com>`, and put the **sender's typed email in
`Reply-To`** so replies reach the real sender. The sender's name is surfaced as
the From display name (e.g. `Gerald via RoastCard <cards@yourdomain.com>`) and
inside the card body.

### 4.3 Domain

**Decision:** Host the app at **`roastcard.geraldtui.com`** and verify the
sending domain in Resend (either `geraldtui.com` or the `roastcard.geraldtui.com`
subdomain). This is required to deliver to arbitrary recipients (Resend's
domain-free `onboarding@resend.dev` can only deliver to your own verified
address). Verifying the domain (SPF/DKIM DNS records) is a one-time setup step
and is required before real sends work.

The From address will be on this domain, e.g. `cards@roastcard.geraldtui.com`.

---

## 5. Roast Content

**Decision:** A **hardcoded list of ~30–50 roast templates**, each containing a
`{name}` placeholder. On send, pick one at random and interpolate the
recipient's name.

- **Tone:** Playful / affectionate ribbing. **No profanity, no slurs.** Safe to
  send to a friend.
- **Selection:** Uniform random pick server-side.
- **Surprise:** **No preview.** The sender does not see or choose the roast;
  hitting Send is a surprise. (Keeps the UI minimal per requirements.)

Roast templates live in a single module (e.g. `lib/roasts.ts`) exporting a typed
array and a `getRandomRoast(name: string)` helper, so the source can later be
swapped for an API without touching callers (see §9).

Example template shape:

```ts
// "{name}" is replaced with the recipient's name
"Happy birthday {name}! You're not old, you're a classic — like a fax machine."
```

---

## 6. UI / UX

Single page, centered card, minimal and sleek (Tailwind).

### Layout

- App title / small logo.
- Four inputs, stacked, with clear labels and placeholders:
  - Recipient Name
  - Recipient Email
  - Sender Name
  - Sender Email
- Hidden honeypot input (visually hidden, `aria-hidden`, `tabindex=-1`).
- A primary **Send** button.

### States & feedback

**Decision:** Inline success/error feedback on the **same page** (no redirect):

- **Idle:** form ready.
- **Submitting:** button shows a loading/disabled state.
- **Success:** inline message, e.g. "Card sent! 🎉" + form resets.
- **Error:** inline error message (validation or send failure) without losing
  entered values.

### Client-side validation

- All four fields required.
- Recipient/Sender email must match a basic email format.
- Disable Send while submitting.

---

## 7. API Contract

### `POST /api/send`

Request body (JSON):

```json
{
  "recipientName": "string",
  "recipientEmail": "string (email)",
  "senderName": "string",
  "senderEmail": "string (email)",
  "company": "string (honeypot — must be empty)"
}
```

Server behavior:

1. If honeypot (`company`) is non-empty → return `200` but do nothing (silently
   drop, don't tip off bots).
2. Validate all fields present + email formats. On failure → `400` with a
   message.
3. Pick a random roast, interpolate recipient name.
4. Render the React Email card to HTML.
5. Send via Resend:
   - `from`: `"{senderName} via RoastCard <cards@roastcard.geraldtui.com>"`
   - `to`: recipient email
   - `reply_to`: sender email
   - `subject`: e.g. `"🎂 Happy Birthday, {recipientName}!"`
   - `html`: rendered card
6. On Resend success → `200 { ok: true }`. On failure → `500` with a safe error
   message.

Responses are JSON; the client renders success/error inline.

---

## 8. Abuse Protection & Validation (MVP)

The endpoint lets anyone email anyone — a spam vector that can burn free-tier
quotas and harm domain reputation.

**Decision (MVP): minimal.**

- Server-side + client-side **email format validation**.
- A **hidden honeypot** field to catch naive bots.

Structured so the following can be added later without redesign:

- Per-IP **rate limiting** (e.g. Upstash Redis free tier).
- A **CAPTCHA** (e.g. Cloudflare Turnstile, free).

These are deferred to keep the MVP fast to ship, accepting some spam risk for a
low-traffic launch.

---

## 9. Future Extensions (designed-for, not built)

- **AI roasts:** swap `getRandomRoast()` for an LLM call behind the same
  interface. Adds cost/latency/another secret.
- **Preview & shuffle:** let the sender regenerate/pick a roast before sending.
- **Spicier tones:** tone setting (playful / savage-clean / crude).
- **Stronger anti-abuse:** rate limiting + CAPTCHA.
- **Scheduling:** send on a chosen date (requires storage + a cron/queue).

---

## 10. Environment & Config

| Variable          | Purpose |
|-------------------|---------|
| `RESEND_API_KEY`  | Server-only secret for Resend (never exposed to client) |
| `FROM_EMAIL`      | Fixed verified-domain From address, e.g. `cards@roastcard.geraldtui.com` |

Setup steps:

1. Create a Resend account, add and **verify the sending domain** (DNS records
   for `geraldtui.com` or the `roastcard.geraldtui.com` subdomain).
2. Set `RESEND_API_KEY` and `FROM_EMAIL` as Vercel project env vars.
3. Deploy to Vercel (free Hobby tier) and point `roastcard.geraldtui.com` at the
   Vercel project (CNAME).

---

## 11. Open Questions

- ~~**Domain name:** which custom domain will be verified for the From
  address?~~ **Resolved:** app hosted at `roastcard.geraldtui.com`; From address
  on that domain.
- **App name/branding:** is "RoastCard" the final name (affects From display
  name, page title)?
- **Subject line copy:** lock the exact subject and any emoji.
- **Roast list authoring:** who writes the ~30–50 roasts, and do they need review
  for tone before launch?
