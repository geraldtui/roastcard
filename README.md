# RoastCard

A tiny web app that emails a friend a good-looking birthday card containing a
random, affectionate roast. Built with Next.js (App Router), TypeScript,
Tailwind CSS, React Email, and Resend.

See [`ROASTCARD_SPEC.md`](./ROASTCARD_SPEC.md) for the full design and
[`.specs/`](./.specs) for the implementation specs.

## How it works

```
Browser form ──POST /api/send──▶ Next.js route handler ──▶ Resend ──▶ inbox
```

A single serverless route (`app/api/send/route.ts`) holds the Resend secret,
validates input, picks a random roast, renders the React Email card, and sends
it. Everything else is static.

## Getting started

```bash
npm install
cp .env.example .env.local   # optional for local dev
npm run dev
```

Open http://localhost:3000.

### Mock send mode

If `RESEND_API_KEY` is **not** set, the API runs in mock mode: it logs the
would-be email to the server console and returns success, so you can exercise
the full flow locally without sending real email.

### Real sends

1. Create a [Resend](https://resend.com) account and **verify your sending
   domain** (add the SPF/DKIM DNS records).
2. Set environment variables (locally in `.env.local`, in production as Vercel
   project env vars):
   - `RESEND_API_KEY` — your Resend API key.
   - `FROM_EMAIL` — a verified-domain address, e.g. `cards@roastcard.geraldtui.com`.
3. The card is always sent **from** the fixed `FROM_EMAIL` (with the sender's
   name as the display name); the sender's typed email is set as `Reply-To`.

## Project structure

| Path | Purpose |
|------|---------|
| `app/page.tsx` | Single-page form UI with inline feedback |
| `app/api/send/route.ts` | `POST /api/send` — validate, pick roast, render, send |
| `emails/RoastCard.tsx` | React Email card template |
| `lib/roasts.ts` | Roast templates + `getRandomRoast()` |
| `lib/validation.ts` | Email format + payload validation |

## Scripts

```bash
npm run dev      # start dev server
npm run build    # production build
npm run start    # run the production build
```

## Deploy

Deploy to the Vercel free (Hobby) tier with zero config. Set `RESEND_API_KEY`
and `FROM_EMAIL` as project env vars and point your domain at the project.
