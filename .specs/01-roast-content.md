# Spec: Roast Content Module

**Status:** Verified
**Parent:** `ROASTCARD_SPEC.md` (§5)
**Last updated:** 2026-06-06

## User Story

As a sender, I want the app to pick a random, name-personalized birthday roast, so that the card delivers a fun surprise without me having to write anything.

## Context

**Why:** The roast is the product's payload (`ROASTCARD_SPEC.md` §5). The MVP uses a hardcoded list of playful, clean roasts selected uniformly at random server-side. No preview/shuffle (it's a surprise).

**Related:**
- `02-email-card-template.md` (consumes the roast text)
- `03-send-api.md` (calls the random picker)

**Dependencies:** None (pure TypeScript module).

## Technical Specification

**Modules:**
- NEW `lib/roasts.ts` — exports a typed `roasts: string[]` array of 30–50 templates (each containing a `{name}` placeholder) and `getRandomRoast(name: string): string` which picks one uniformly at random and interpolates the name.

**Behavior:**
- `{name}` placeholder is replaced with the provided recipient name (all occurrences).
- Tone: playful/affectionate ribbing. No profanity, no slurs.
- Selection: uniform random (`Math.random`).
- Interface kept minimal so the source can later be swapped for an LLM call without touching callers (`ROASTCARD_SPEC.md` §9).

## Acceptance Criteria

- [ ] **AC1**: Module exports a roast list of between 30 and 50 templates.
  - Given the `lib/roasts.ts` module
  - When the `roasts` array length is checked
  - Then it is >= 30 and <= 50, and every entry contains `{name}`

- [ ] **AC2**: `getRandomRoast` interpolates the recipient name.
  - Given a name `"Sam"`
  - When `getRandomRoast("Sam")` is called
  - Then the returned string contains `"Sam"` and contains no `{name}` placeholder

- [ ] **AC3**: Selection is uniform/random across calls.
  - Given many calls to `getRandomRoast`
  - When results are collected
  - Then more than one distinct template is observed (not always index 0)

- [ ] **AC4**: Content is clean.
  - Given the roast list
  - When reviewed
  - Then no profanity or slurs are present and tone is friendly
