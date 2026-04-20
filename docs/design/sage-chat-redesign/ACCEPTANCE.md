# Sage Chat Redesign — Acceptance Criteria (v2, Tailwind)

Paste-into-PR checklist for `feat/sage-chat-redesign`. Every box must be checkable against live behavior or a specific line of the diff.

---

## Scope guardrails

- [ ] No changes to `app/api/sage/route.ts` or the booking-card system-prompt injection.
- [ ] No changes to `parseBookingCards`, `injectInlineEmbed`, or `BookingCard` internals.
- [ ] No changes to `sage_parameters` schema or admin UI.
- [ ] No changes to `useSageStore` shape. `hasGreeted`/`setGreeted` may become unused after this patch — that is acceptable; cleanup is deferred.
- [ ] `markdownComponents` inline styles at the top of `Chat.tsx` are **not** migrated in this patch (follow-up).
- [ ] Branch is `feat/sage-chat-redesign` off `main`.
- [ ] Exactly 4 files touched: `app/globals.css`, `src/lib/store.ts` (no-op), `src/components/Chat.tsx`, `CLAUDE.md`.

---

## Tailwind posture

- [ ] All new/rewritten JSX in `Chat.tsx` uses Tailwind classes. No new inline `style={{...}}` blocks, except the single `opacity: keyboardOpen ? 0 : 1` on the composer tagline (documented in PATCH_PLAN 3.11) and the per-dot `animationDelay` on the streaming indicator (documented in 3.10).
- [ ] Token aliases from `tailwind.config.js` are used wherever they apply: `bg-bg`, `bg-surface`, `bg-accent`, `text-accent`, `border-accent`, `font-display`, `font-body`, `font-mono`.
- [ ] Tailwind arbitrary values reference CSS variables (e.g. `text-[color:var(--color-text-primary)]`, `pb-[max(12px,calc(env(safe-area-inset-bottom)+var(--kb-h)))]`) only where no alias exists.
- [ ] No new raw hex codes in markup — `#2d6a4f` in `Chat.tsx` is replaced by `accent` token usages.

---

## `app/globals.css` additions

- [ ] `--kb-h: 0px` is declared on `:root`.
- [ ] `body.sage-locked` uses `position: fixed; top: var(--sage-scroll-y, 0)` — scroll position is preserved.
- [ ] `.sage-visitor-msg` sets `quotes: "\201C" "\201D" "\2018" "\2019"` and applies `::before { content: open-quote }` / `::after { content: close-quote }`.
- [ ] `@keyframes sage-slide-up` and `@keyframes sage-pulse` exist in `app/globals.css`.
- [ ] `@keyframes expandChat` has been **moved** from the inline `<style>` in `Chat.tsx` to `app/globals.css`; overlay entry still animates.
- [ ] `@media (prefers-reduced-motion: reduce)` disables `.sage-animate`, `.sage-visitor-msg`, and `[data-sage-streaming] > *` animations/transitions.
- [ ] `--color-text-muted` has been bumped to ≥70% opacity (or repointed to a token that computes ≥4.5:1 against `--color-bg`), and a contrast check on 18px italic Playfair body copy passes WCAG AA.

---

## `Chat.tsx` — behavior preservation

- [ ] All existing `useEffect` hooks are preserved (sage parameters fetch, body scroll lock, message scroll-into-view, `visualViewport` keyboard listener, Escape-to-close, URL mode detection).
- [ ] `streamSageResponse` call signature is unchanged in `send` and `retryLastSend`.
- [ ] Session POST + PATCH flow fires on first user message and after each completed reply (both `send` and `retryLastSend`).
- [ ] `question` mode detection via URL (`?mode=question` on fresh load) still opens the overlay into question mode.
- [ ] `retryMsgsRef` and `retrySessionIdRef` still capture the correct snapshot for retry.
- [ ] `isError` state is entered on stream throw and cleared on Retry.
- [ ] The `{isError && !isStreaming && ...}` block still renders the error card + Retry button — `SageReply` does **not** swallow error-state messages.

---

## Greeting collision resolved

- [ ] The `sendGreeting` function is deleted from `Chat.tsx`.
- [ ] No call site invokes `sendGreeting` (grep the file).
- [ ] The scroll-lock `useLayoutEffect` does not call `sendGreeting` or any greeting helper.
- [ ] `messages.length === 0` is the greeting state. First user `send` populates `messages` and the empty-state block unmounts.
- [ ] No duplicated/doubled greeting message appears when opening the overlay.

---

## Orphaned keyframes resolved

- [ ] The inline `<style>` block at the bottom of `Chat.tsx` is removed in its entirety.
- [ ] The streaming-dot block uses `sage-pulse` (not `pulse`).
- [ ] The overlay wrapper's inline `animation: 'expandChat 0.3s ease-out'` still animates (keyframes now live in `app/globals.css`).

---

## Header

- [ ] Header height is 56px (`h-14`) with `bg-bg/90` + backdrop blur.
- [ ] Status pip: 6px circle, `bg-accent` when `isStreaming`, `bg-accent/35` otherwise, 150ms color transition.
- [ ] Wordmark: `font-display` 22px, `font-weight: 400`, `tracking: -0.01em`, color `--color-text-primary`.
- [ ] Close button: 44×44 hit area, SVG X glyph (not `✕`), `aria-label="Close chat"`.
- [ ] Clicking the close button fires `collapse()`.

---

## Empty-state greeting (replaces the "Hello." block)

- [ ] Empty state renders a 2px `border-accent/35` left rule with 16px left padding, max-width 680px.
- [ ] Playfair copy, `clamp(26px, 4vw, 36px)`, color `--color-text-primary`.
- [ ] Copy branches on `mode`:
  - default mode → `"Hi, I'm Sage. "` + italic `"What brings you here?"`
  - question mode → `"Ask me anything about "` + italic `"Jeff's work"` + `"."`
- [ ] Empty state disappears on the first user `send` (i.e. when `messages.length > 0`).

---

## Visitor message

- [ ] Visitor reply is right-aligned, italic Playfair, 18px, color `--color-text-muted`.
- [ ] Rendered inside a `<p>` with classes `.sage-visitor-msg` and `.sage-animate`.
- [ ] CSS curly quotes wrap the text — no curly-quote characters in the content string.
- [ ] `whitespace-pre-wrap` is preserved (multi-line input still line-breaks).
- [ ] Text contrast against `--color-bg` meets WCAG AA at 18px italic (≥4.5:1) — verified in a checker.
- [ ] Entry animation is `sage-slide-up`, 240ms, `ease-out`.

---

## Sage reply (assistant branch)

- [ ] Assistant messages render via `SageReply` (see PATCH_PLAN 3.5).
- [ ] `SageReply` has a 2px `border-accent/35` left rule, 16px left padding, max-width 680px. **No bubble** — no background, no border-radius, no box-shadow.
- [ ] Prose uses `font-display` (Playfair), 18px, `leading-[1.55]`, `text-wrap: pretty`.
- [ ] `SageReply` renders `<ReactMarkdown components={markdownComponents}>` for the prose; `markdownComponents` is untouched.
- [ ] Booking cards are rendered by `<BookingCard {...card} openAs={...} embedCode={...}>` — verbatim pass-through from `parseBookingCards` + `sageParameters`. `BookingCard` is imported by reference, not re-implemented.
- [ ] Entry animation is `sage-slide-up`, 280ms, `ease-out`.
- [ ] `SageReply` does not render error-state content.

---

## Streaming indicator

- [ ] 3 × 6px circles, `bg-accent`, animated via `sage-pulse` with 0s / 0.2s / 0.4s delays.
- [ ] Wrapper carries `data-sage-streaming` for the reduced-motion CSS guard.
- [ ] Disappears as soon as the first chunk lands (existing condition `messages[last]?.content === ''`).

---

## Composer

- [ ] Tray padding bottom is `max(12px, calc(env(safe-area-inset-bottom) + var(--kb-h)))`.
- [ ] Tray uses `bg-surface` and `border-t border-black/[0.08]`.
- [ ] Textarea: `bg-bg`, `rounded-xl`, `border-black/[0.12]`, min-height 48px, max-height 120px, `font-body`, 16px.
- [ ] Send button: 44×44 circle, `bg-accent`, white `→`, `aria-label="Send message"`, `disabled:opacity-40 disabled:cursor-not-allowed`.
- [ ] Tagline renders under the input; opacity 0 when `keyboardOpen`, 300ms transition.

---

## iOS keyboard behavior

- [ ] On iOS 17.4+, `100dvh` resolves to viewport-minus-keyboard; tray sits flush to keyboard with no float.
- [ ] On iOS < 17.4, `visualViewport` resize + scroll listeners publish `--kb-h` on `:root`, and the tray uses it via the `pb-[...]` Tailwind expression.
- [ ] The `visualViewport` listener resets `--kb-h` to `0px` on desktop (`matchMedia('(max-width: 768px)')` is false).
- [ ] The effect does **not** mutate `top`/`height` on the overlay inline (avoids the mid-screen float regression noted in the existing CLAUDE.md).

---

## Body scroll lock

- [ ] On open, `body.sage-locked` is added and `--sage-scroll-y` is set to `-{scrollY}px`.
- [ ] On close, class is removed, `--sage-scroll-y` is deleted, and `window.scrollTo(0, scrollY)` restores the page position.
- [ ] Reloading the page while the overlay is open does not leave the body permanently scroll-locked (the effect's cleanup runs on unmount).

---

## `#chat` anchor section

- [ ] The inline 240px transcript preview (`messages.length > 0 && <div style={{maxHeight: 240, ...}}>`) is removed.
- [ ] Eyebrow ("Not Sure Yet?"), headline, lede, green Start/Continue CTA, and outlined Book a Session link remain.
- [ ] CTA label toggles "Start a Conversation" / "Continue Conversation" on `messages.length`.
- [ ] `#chat` hash anchor still scrolls to the section; reveal animation still fires.

---

## CLAUDE.md

- [ ] Public-site Chat row reflects: compact header with status pip, `SageReply` typographic replies, italic visitor replies with CSS curly quotes, empty-state-as-greeting, `sendGreeting` removed, Tailwind-only markup.
- [ ] `#chat` anchor section notes transcript preview removed.
- [ ] No restructuring of CLAUDE.md beyond those two edits.

---

## Entry point consistency

- [ ] All four chat entry points open the overlay to the same empty-state greeting with the same behavior: Hero "Start a Conversation", Nav CHAT button, `#chat` section CTA, and `/#chat?mode=question` URL load. Verify no entry point renders a duplicated greeting, a stale transcript, or different initial state.

---

## Accessibility

- [ ] Send button: `aria-label="Send message"`.
- [ ] Close button: `aria-label="Close chat"`.
- [ ] Status pip has `aria-hidden`.
- [ ] Streaming wrapper has `data-sage-streaming` so reduced-motion can target it.
- [ ] `prefers-reduced-motion: reduce` disables `.sage-animate`, `.sage-visitor-msg`, and `[data-sage-streaming] > *` animations/transitions.
- [ ] All hit targets ≥44px (send, close).
- [ ] Contrast: `--color-text-muted` on `--color-bg` ≥4.5:1 for 18px italic body; accent on `--color-bg` ≥3:1 for the pip and left rule.

---

## Manual QA

- [ ] iPhone SE (375×667) Safari — header, greeting, first send, composer tray pinned above keyboard, tagline hides on focus.
- [ ] iPhone 15 Pro (393×852) Safari — same, plus safe-area inset respected on tray bottom padding.
- [ ] Android Chrome (412×915) — tray stays pinned with keyboard open, no overlay jump.
- [ ] Desktop Safari/Chrome (≥769px) — overlay renders full height, `--kb-h` stays `0px`, no layout shift on focus.
- [ ] Open overlay → Escape key → overlays closes; body scroll restored.
- [ ] Open overlay → scroll page behind doesn't move; close → page is back at original scroll position.
- [ ] First send with no existing session: `POST /api/sessions` fires, `sessionId` populates, `PATCH /api/sessions/:id` fires after reply completes.
- [ ] Retry path: simulate stream throw (throttle or kill route mid-stream) → error card + Retry appears → Retry re-runs the last payload → on success, error card clears.
- [ ] Booking card flow: prompt Sage for a booking link → response contains `[BOOKING: …]` → card renders inside `SageReply` → popup `open_as` injects the embed, `new_tab` opens the URL with the heads-up line below.
- [ ] Question mode via `?mode=question` → overlay auto-opens, greeting renders the question-mode copy.
- [ ] Reduced-motion preference: enable in OS → no entry animations, no streaming-dot pulse, no greeting fade.

---

## Out-of-scope reminders (do not land here)

- [ ] No starter chips (TODO-00).
- [ ] No attach/(+) button (TODO-01).
- [ ] No mic morph (TODO-02).
