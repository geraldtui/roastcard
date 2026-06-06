# Spec: Email Card Template

**Status:** Verified
**Parent:** `ROASTCARD_SPEC.md` (§3, §4.1)
**Last updated:** 2026-06-06

## User Story

As a recipient, I want to receive a good-looking birthday card email containing my personalized roast, so that the message lands well and feels like a real card.

## Context

**Why:** The card must render reliably across inboxes (`ROASTCARD_SPEC.md` §3 uses React Email). It greets the recipient, shows the roast, and attributes the card to the sender.

**Related:**
- `01-roast-content.md` (provides the roast text)
- `03-send-api.md` (renders this template to HTML and sends it)

**Dependencies:** `@react-email/components`.

## Technical Specification

**Components:**
- NEW `emails/RoastCard.tsx` — a React Email component accepting props `{ recipientName: string; senderName: string; roast: string }`. Renders a centered, minimal card: title/branding ("RoastCard"), greeting using `recipientName`, the `roast` body, and a "from {senderName}" attribution.

**Behavior:**
- Uses React Email primitives (`Html`, `Body`, `Container`, `Heading`, `Text`, etc.) with inline styles for cross-client reliability.
- Self-contained (no external CSS); safe fallback fonts and colors.
- Default export is the component so it can be rendered via `@react-email/components` `render()`.

## Acceptance Criteria

- [ ] **AC1**: Card renders with all three props.
  - Given props `{ recipientName, senderName, roast }`
  - When the component is rendered to HTML
  - Then the output contains the recipient name, the roast text, and the sender name

- [ ] **AC2**: Card shows branding and greeting.
  - Given the rendered card
  - When inspected
  - Then it includes the "RoastCard" title and a birthday greeting addressed to the recipient

- [ ] **AC3**: Output is email-safe HTML.
  - Given the rendered output
  - When produced
  - Then it is a complete HTML document with inline styles (no reliance on external stylesheets)

- [ ] **AC4**: Attribution is present.
  - Given a sender name
  - When the card renders
  - Then it displays a "from {senderName}" style attribution
