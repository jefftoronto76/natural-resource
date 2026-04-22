# CLAUDE.md — Natural Resource / Sage Platform

This file is read at the start of every Claude Code session. These principles
are non-negotiable. Apply them to every task. If you cannot follow a principle
on a given task, say so explicitly before proceeding — do not silently skip it.

**This file must stay current.** If the stack, schema, or principles change,
updating CLAUDE.md is part of the Definition of Done for that change — not a
follow-up task.

---

## Principles

### Mobile-First, Responsive on First Pass
Every component ships responsive. Mobile is not a second pass or a polish task
— it is part of the definition of done. Design and build mobile-first, then
extend to desktop cleanly.

### Design Quality Equals Feature Delivery
Aesthetics and functionality are weighted equally. Zero design debt is the
target. Acceptable debt is work that is functional but not yet polished.
Unacceptable debt is anything inconsistent with the design system — that is a
blocker, not a backlog item. We do not ship visually inconsistent work.

### Flexibility Over Convenience
Every architecture decision gets pressure-tested for lock-in. The test is
whether a decision closes a real door, not whether a future scenario can be
imagined. We do not abstract for hypotheticals. Prefer composable, reversible
decisions over fast ones — but only where a real constraint exists.

### Test Plans Are Part of Every Build
Write the test plan before implementation begins. No component ships without
tests. If the task scope makes this impossible, flag it explicitly before
proceeding — do not silently skip it.

### Highest Data Security
Security is a first-class requirement, not a layer added later. Data is
encrypted at rest and in transit. Row Level Security enforced at the database
layer. Access is least-privilege by default. No exceptions.

### Privacy by Design
Collect only what is needed. User data is not stored beyond its purpose.
Privacy obligations are defined before a feature ships, not after. Applies to
visitor chat data, SMS, client threads, and all multi-tenant data.

### API Before Build
Before writing custom logic, check whether an API, library, or platform service
already solves the problem. We do not build what already exists.

### User Experience Over Development Ease
When there is tension between what is easier to build and what is better for
the user, the user wins. Development convenience is never a justification for a
worse experience.

### Plan Before Implementation
Default to planning before writing code. Understand the full scope, the data
model, the edge cases, and the dependencies before touching the repo. Trust the
plan, but verify as you go.

### Accessibility Is Non-Negotiable
Semantic HTML, keyboard navigation, screen reader support, and sufficient color
contrast are part of the definition of done on every component — not a retrofit.

### Error Handling and Graceful Degradation
The app owns its failures. No raw errors surface to users. Every failure state
has an on-brand, user-appropriate response. Fallback behavior is defined before
a component ships.

### Performance Is a Feature
Performance is measured, not assumed. Targets apply to every component:
- LCP under 2 seconds on mobile
- Non-AI API routes under 500ms
- Anthropic streaming: first token under 1 second
- Core Web Vitals pass on mobile — verified via Vercel on every deploy
- Anthropic API cost tracked per session — uncontrolled token usage is an
  architecture problem, not a billing one

### Observability
Logging and monitoring are part of the build. Errors are captured, surfaced in
the admin health panel, and actionable. If something breaks, we know before the
user tells us.

### Documentation Stays Current
PRDs, handoff docs, and architecture decisions are updated as part of shipping.
A feature is not merged until the PRD and any relevant handoff docs reflect the
change. Documentation is a PR gate, not a follow-up task.

### One Change at a Time
Surgical, single-change builds with verification before proceeding. Compound
changes introduce compound risk. Every step is confirmed before the next one
starts.

---

## Stack

- **Framework:** Next.js 15, React 19, TypeScript (strict mode — always)
- **Styling:** Tailwind (public site), Mantine v7 (admin interface)
  — v7 is intentional. v9 requires React canary APIs not in React 19 stable.
  Do not upgrade Mantine without explicit instruction from Jeff.
  Companion packages: `@mantine/notifications@7.17.8` (toast notifications,
  wired into `app/admin/layout.tsx` via `<Notifications />`).
- **Database:** Supabase (Postgres + Row Level Security + Realtime)
- **Auth:** Clerk
- **AI:** Anthropic API (`claude-sonnet-4-6`) + Vercel AI SDK (streaming + fallback)
- **Fallback model:** OpenAI via Vercel AI SDK
- **SMS:** Twilio
- **Deployment:** Vercel

---

## Branch Convention

- Every feature gets its own branch
- Always branch from the most current working branch:
  `git checkout [base-branch] && git pull origin [base-branch] && git checkout -b [new-branch]`
- No changes directly to main unless explicitly instructed by Jeff
- Commit messages are descriptive and specific
- Incremental commits with confirmation between steps — do not batch everything
  into one commit at the end

---

## Design System

- **Admin interface:** Mantine v7 — components in `/components/admin/`
- **Public site:** Tailwind — components in `/src/components/`
- **Shared design tokens:** `/components/admin/theme/mantine-theme.ts`
- **Rule:** No new admin screen is built before the relevant Mantine component
  foundation exists. Design system before screens — always.

| Token | Value |
|-------|-------|
| Background | `#f9f8f5` |
| Accent green | `#2d6a4f` |
| Text primary | `#1a1917` |
| Text muted | `rgba(26,25,23,0.55)` |
| Font display | Playfair Display |
| Font body | DM Sans |
| Font mono | DM Mono |
| Min font size | 16px (labels/mono UI: 11px acceptable) |
| Spacing unit | 4px multiples |

---

## Shared Primitives

Reusable admin-side components in `/components/admin/primitives/`:

| Component | File | Purpose |
|-----------|------|---------|
| `PromptFullnessMeter` | `PromptFullnessMeter.tsx` | Takes `bodies: string[]`, sums character counts, approximates tokens as `ceil(chars/4)`, renders a Mantine `Progress` bar with a monospace label. Color thresholds: green under 5000 tokens, yellow 5000–8000, red over 8000. Used on the Blocks page (reactive to the client-side items state) and the Prompt page (server-fetched on mount). |
| `Text` | `Text.tsx` | Typography primitive wrapping Mantine `Text` with four variants: `body` / `label` / `title` / `muted`. Always renders as `<p>` (`component="p"` is hardcoded on line 44). **Does NOT passthrough polymorphic props** (`component`, `as`, `renderRoot`) — its prop surface only exposes `variant` + `HTMLAttributes<HTMLParagraphElement>`. For non-`<p>` semantic rendering (e.g. monospace `<pre>` blocks, inline `<code>`), use raw HTML elements styled with Mantine CSS variables (`var(--mantine-font-family-monospace)`, `var(--mantine-color-gray-0)`, etc.) — not `<Text component="pre">`, which fails typecheck. |

### Page-local components

| Component | File | Purpose |
|-----------|------|---------|
| `SageParameters` | `app/admin/settings/SageParameters.tsx` | Mantine-based client component rendered inside the Parameters section on the Settings page. Owns the section header row (title + "Add New" button, right-aligned) and the card list below it. Fetches `/api/admin/sage-parameters` on mount. Each existing parameter renders as a Mantine `Card` showing Label (title), Description (subtitle), CTA label, URL, and Open-as (with Embed-code status when `open_as = 'popup'`), plus edit (pencil) / delete (trash) `ActionIcon`s top-right. Edit expands the card inline with `TextInput`s for Label, Description (max 60 chars, live counter), CTA Label (max 20 chars, live counter), and URL; a Mantine `Select` for Open behavior (`New Tab` / `Inline` — the `Inline` option maps to the `open_as = 'popup'` DB value for backwards compatibility); and — only when Inline is selected — a monospace Mantine `Textarea` labeled "Embed Code" (placeholder "Paste your booking tool's popup snippet here") for the `embed_code` value. Switching back to `New Tab` nulls `embed_code` on save. Save validation blocks PATCH when `open_as = 'popup'` and `embed_code` is empty/whitespace ("Embed code is required for inline booking."). Add New prepends an empty editable card to the top of the list. Save and Add both PATCH `/api/admin/sage-parameters` (Add auto-generates `key` from the label, lowercase non-alphanumerics collapsed to `_`; duplicate keys rejected client-side). Delete opens a Mantine `Modal` confirmation and calls `DELETE /api/admin/sage-parameters/[key]`. Surfaces success/error via `@mantine/notifications`. Console logs cover fetch, PATCH dispatch (with `open_as` / `has_embed_code`), success/failure, DELETE, and add-new-card open. |
| `BookingCard` (+ `parseBookingCards`, `injectInlineEmbed`) | `src/components/Chat.tsx` | Inline Tailwind component and parser used by the public visitor chat. `parseBookingCards(content)` extracts every `[BOOKING: label \| description \| cta_label \| url]` match from an assistant message, strips any trailing incomplete `[BOOKING:` fragment still streaming, collapses leftover blank lines, and returns `{ prose, cards }`. The Chat component also fetches `/api/sage/parameters` on mount, matches each parsed card to a parameter by `url`, and passes `openAs` + `embedCode` as props. `BookingCard` is a white card with `border border-black/10` + `shadow-sm`, bold label, muted description, a `#2d6a4f` CTA, and — directly below the card — a ref'd inline-embed container (`mt-2 w-full min-h-[700px]`, hidden until first click). CTA element type switches on `openAs`: `<a target="_blank" rel="noopener noreferrer">` for `'new_tab'`; `<button>` for `'popup'` (admin label "Inline") that, on click, reveals the container and calls `injectInlineEmbed(container, embedCode)`. `injectInlineEmbed` re-materializes the snippet into live `<script>` / `<link>` nodes scoped to the target container so script tags actually execute (handles both pure inline JS and HTML fragments with `<script src="...">`). The button disables itself after injection to keep the mount idempotent. If `openAs = 'popup'` and `embedCode` is empty, falls back to new-tab behavior and `console.warn`s. When the *effective* open behavior is `new_tab` (either explicitly or via the empty-`embed_code` fallback), a small muted Tailwind `<p>` renders directly below the card: "Heads up — clicking the button will open in a new tab to complete your booking." — suppressed for the in-chat inline case. |

---

## Pages

Admin page routes under `app/admin/`. Each page owns its route header
and section scaffolding; data fetching lives in server components or
page-local client components.

| Page | File | Purpose |
|------|------|---------|
| Settings | `app/admin/settings/page.tsx` | Tenant configuration. Currently contains the Parameters section rendering the `SageParameters` component. |
| Blocks | `app/admin/prompt-studio/blocks/page.tsx` | Server component — fetches all non-deleted blocks for the tenant (including `order`) and renders `BlocksTable`. Table exposes an inline `Order` column: a Mantine `NumberInput` (no stepper, width ~70px) on desktop, and a labeled field on mobile. Values save automatically on blur via `PATCH /api/admin/blocks/[id]` with `{ order }` — no separate save button. Before dispatch, the client checks `items` state for another block of the same `type` with the same `order`; on conflict, a red Mantine notification ("Order number already used by [title] in this type. Please choose a different number.") fires and the save is aborted, reverting the input to its prior value. Console logs cover blur, duplicate-check result, PATCH dispatch, success, failure. |

---

## Public Site (Visitor)

Public-facing components in `/src/components/`. Tailwind + inline
styles (no Mantine on the public side).

| Component | File | Purpose |
|-----------|------|---------|
| `Chat` (Sage overlay + `#chat` anchor section) | `src/components/Chat.tsx` | Full-viewport visitor chat overlay plus the in-page `#chat` anchor section that CTAs into it. Mounted from `app/page.tsx`; toggled via `useSageStore.expand()` / `collapse()`. **Overlay** is `position: fixed; top: 0; height: 100dvh` by default so iOS 17.4+ resizes when the keyboard opens. On older iOS, a VisualViewport listener mutates `overlayRef.current.style.top = vv.offsetTop + 'px'` and `style.height = vv.height + 'px'` on `resize` / `scroll`, pinning the overlay to the visual viewport so the header stays visible when the keyboard is open. Same listener sets `keyboardOpen` state (`vv.height < window.screen.height * 0.75`) which drives the tagline opacity. Compact 56px header (`h-14`, `bg-bg/90` backdrop-blur) with a status pip (`h-1.5 w-1.5 rounded-full`, `bg-accent` when `isStreaming`, `bg-accent/35` otherwise) next to a Playfair 22px wordmark; 44×44 SVG close button. Assistant messages render through `SageReply` — typographic block with a 2px `border-accent/35` left rule, `pl-4`, Playfair 18px prose, `max-w-[680px]`, `sage-slide-up` entry animation; **no bubble** (no bg, no border-radius, no shadow). Visitor messages render as right-aligned italic Playfair `<p>`s with `max-w-[560px]` and the `.sage-visitor-msg` class (defined in `app/globals.css`), which applies CSS curly quotes via `::before` / `::after` — the message content string itself never contains the quote glyphs. Empty state **is** the greeting: mode-aware Playfair copy ("Hi, I'm Sage. *What brings you here?*" default, "Ask me anything about *Jeff's work*." question-mode) in the same left-rule card style. First user send populates `messages` and the empty state unmounts. There is no `sendGreeting` — `messages.length === 0` is the canonical greeting state. Body scroll lock is `document.body.style.overflow = 'hidden'` on open, cleared on close — simple, no scroll-position save/restore; the underlying page may scroll through on iOS (accepted limitation). Composer tray padding is `pb-[max(12px,env(safe-area-inset-bottom))]`; send button is `bg-accent` `h-11 w-11 rounded-full`; textarea is `bg-bg rounded-xl`. The streaming indicator uses three dots with the `sage-pulse` keyframes and carries `data-sage-streaming` for the reduced-motion guard. Reduced motion is honored at the CSS layer via `@media (prefers-reduced-motion: reduce)` disabling animations on `.sage-animate`, `.sage-visitor-msg`, and `[data-sage-streaming] > *`. Only two intentional inline `style` props remain in the overlay JSX: the tagline `opacity: keyboardOpen ? 0 : 1`, and the per-dot `animationDelay` on the streaming indicator — everything else is Tailwind (`markdownComponents` and `BookingCard` internals excepted; a follow-up can migrate `markdownComponents`). Reads `mode` from `useSageStore`; on mount, `detectModeFromLocation()` parses `?mode=question` from the hash-query or top-level search string and — if `'question'` — calls `expand('question')` to auto-open the overlay. `mode` is passed to `streamSageResponse` on every send/retry so the server appends the question-mode CONTEXT block. Booking-card parsing is documented separately under "Booking Card Syntax"; `SageReply` resolves each parsed card to a `sage_parameters` row by URL match and spreads `openAs` / `embedCode` into `<BookingCard>`. **`#chat` anchor section** (same file) renders: eyebrow "Not Sure Yet?" → headline → lede → green Start/Continue CTA → outlined Book a Session link. The inline 240px transcript preview that used to render when `messages.length > 0` has been removed; the CTA label still toggles "Start a Conversation" / "Continue Conversation" based on `messages.length`. Reveal animation on the anchor section is unchanged. |
| `Hero` | `src/components/Hero.tsx` | Hero section with two CTAs (DOM order: left then right). Left "Book a Session" — outlined minimal style (`background: transparent`, muted text, 1px `rgba(26,25,23,0.15)` border); `href="#work"`, `preventDefault` + smooth `scrollIntoView` to the Work section. Right "Start a Conversation" — filled black style (`background: var(--color-text-primary)`, `color: rgb(var(--color-bg))`); `href="#chat"`, `preventDefault` + `expand()` (no args → default mode). |
| `Nav` | `src/components/Nav.tsx` | Top fixed navigation. Two links from a `LINKS` array: `Schedule` (`#work`) and `Chat` (calls `expand()` on click — default mode). Desktop and mobile Chat entries diverge. **Desktop** uses `.nav-chat-btn` (plain muted uppercase mono text — same color token as Schedule — with padding `8px 16px` and `border-radius: 8px`; no visible border pre-trigger). A Nav-level `IntersectionObserver` (threshold 0.15) watches the WhyMe section root via `[data-nav-trigger="how-i-operate"]`; on first intersection, `chatBorderDrawn` flips to `true`, the observer disconnects, and the `.nav-chat-btn--drawn` modifier triggers a 700ms ease-out two-stage CSS animation that traces a 1px accent-green border clockwise from top-left (top+right 0–350ms, bottom+left 350–700ms). One-shot: border stays drawn for the rest of the session; scrolling back up does not reset it. **Mobile hamburger drawer** still uses the pre-existing `.nav-chat-pill` filled green pill (`#2d6a4f` bg, white text, `border-radius: 999px`; hover swaps to `var(--color-accent-hover)`; `:focus-visible` adds a 2px accent outline; padding `14px 24px` with top margin and `align-self: flex-start`) — a separate follow-up task will overhaul mobile. Schedule renders as a plain text link, unchanged. Class definitions live in `app/globals.css`. |
| `Work` | `src/components/Work.tsx` | Two service cards (Coaching / Embedded Execution) each with an inline Calendly widget that toggles open via local state and is initialized via the global Calendly script (loaded once on mount). Below the cards: "Still have questions? Click here." line. The "Click here" link uses `href="/#chat?mode=question"` (decorative — preserves the deep-linkable URL for copy/share) and an `onClick` that `preventDefault`s, calls `history.pushState` to update the URL bar (only when the hash isn't already `#chat?mode=question`), then calls `expand('question')` from the Sage store. The overlay opens directly in question mode — no scroll handoff to the chat anchor section. |

### Discovery-call link cleanup

The free 15-minute discovery call is removed as a **user-facing link**
on the public site — `Work.tsx`'s "Click here" routes to question mode
instead. The discovery call is **not** removed from Sage's master
system prompt; Sage may still offer it at her discretion during a
conversation. Remaining intentional references:

- `src/lib/sage-prompt.ts` — `DEFAULT_SYSTEM_PROMPT` pricing + behavior + booking-link sections
- `src/components/Session.tsx` — `handleDiscoveryClick` popup invocation and the "Start with a free 15-minute call →" link

Do not remove these without explicit instruction.

---

## Utilities

Shared helpers in `src/lib/`:

| Helper | File | Purpose |
|--------|------|---------|
| `getAuthContext` | `get-auth-context.ts` | Resolves the current Clerk user to their Supabase `owner_id` and `tenant_id` via the `users.clerk_id` → `tenant_users.user_id` lookup. Throws `Unauthorized` / `User not found` / `Tenant not found` on failure. Used by every authenticated admin API route for tenant scoping. |
| `getTenantFromRequest` | `get-tenant-from-request.ts` | Resolves `tenant_id` from the `Host` header of an anonymous public request. Strips subdomains to the root domain (e.g. `app.jefflougheed.ca` → `jefflougheed.ca`), filters dev hosts (localhost, `*.local`, `127.0.0.1`), queries `tenants.domain` for a match. Returns `tenant_id` string or `null`. Used by `/api/sage/route.ts` for anonymous visitor chat — falls back to `DEFAULT_SYSTEM_PROMPT` on null. |
| `useSageStore` | `store.ts` | Zustand store for the public visitor chat. State: `messages`, `isExpanded`, `mode: 'question' \| null`, `hasGreeted`, `visitorName`, `isStreaming`, `sessionId`. Actions: `expand(mode?: 'question')` (sets both `isExpanded: true` and `mode: mode ?? null` atomically), `collapse()`, `addMessage`, `updateLastMessage`, `setVisitorName`, `setGreeted`, `setStreaming`, `setSessionId`, `reset()` (clears mode along with everything else). Consumed by `Chat`, `Hero`, `Nav`, and `Work`. Because `expand` takes an optional parameter, do not pass it directly as an event handler — wrap as `() => expand()` so React does not forward the `MouseEvent` into the `mode` slot (TS error). |

---

## API Routes

Admin routes all call `getAuthContext()` first and scope Supabase
queries by `tenant_id`. Public routes resolve tenant via the Host
header.

### Prompt compilation

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/admin/prompt/compile` | POST | Compiles all active blocks for the authenticated tenant into the master prompt. Orders by compile sequence (guardrail → identity → process → knowledge → escalation); within each type, blocks with `order > 0` come first ascending by order, then blocks with `order` = 0 or null come last ordered by title ascending. Logs the final compile sequence (title, type, order) before joining. Joins bodies with double newlines. Archives the previous `master_prompt` row to `master_prompt_history` and increments the version. Returns `{ success, version, tokenCount, content, updatedAt }`. |
| `/api/admin/prompt/compile/check` | POST | LLM-based safety review of a single block body. Takes `{ body: string }`, returns `{ ok: boolean, issues: [{ description: string, offendingText: string \| null }] }`. Server-side verbatim guard: every returned `offendingText` is validated against `body.includes()` and nulled if not a real substring. Fails open to `{ ok: true, issues: [] }` on any error so the save flow is never blocked. |
| `/api/admin/prompt/save` | POST | Manual save path for the master prompt (legacy). Takes `{ prompt, checkResult }`, tenant-scoped, archives previous version to history, increments version. |
| `/api/admin/prompt/check` | POST | Safety check for an entire system prompt (legacy, used by the old prompt save flow). Returns `{ pass, issues }`. |

### Blocks

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/admin/blocks` | GET | Returns active blocks (`id, title, type, body, is_default`) for the authenticated tenant. Filters `active = true`, ordered by type then title. Used for the Composer's existing-blocks context. |
| `/api/admin/blocks/[id]` | PATCH | Updates block `status`, `body`, or `order`. Validates status against `'active' \| 'disabled' \| 'deleted'`; `order` must be an integer. Keeps the legacy `active` boolean in sync with `status` so the Composer GET doesn't surface disabled or deleted blocks. Tenant-scoped via `.eq('tenant_id', authCtx.tenant_id)`. |
| `/api/admin/blocks/save` | POST | Creates a new block from the Composer draft confirmation flow. |
| `/api/admin/blocks/chat` | POST | Streaming chat route for the Composer. Accepts `{ type, topic, content, messages, documentContext?, existingBlocks? }`. Returns a Vercel AI SDK data stream. |

### Sage Parameters

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/admin/sage-parameters` | GET | Returns all `sage_parameters` rows (`id, tenant_id, key, value, label, description, cta_label, url, open_as, embed_code, updated_at`) for the authenticated tenant, ordered by `key`. 401 when `getAuthContext()` fails. |
| `/api/admin/sage-parameters` | PATCH | Upserts a single parameter for the authenticated tenant. Accepts `{ key, label, description?, cta_label?, url?, value?, open_as?, embed_code? }` (strings except `embed_code` which may be string or null; `description` max 60 chars, `cta_label` max 20 chars; `open_as` one of `'new_tab' \| 'popup'`, default `'new_tab'`). Upsert uses `onConflict: 'tenant_id, key'` and stamps `updated_at` on write. 401 when `getAuthContext()` fails, 400 on invalid body. |
| `/api/admin/sage-parameters/[key]` | DELETE | Deletes the parameter matching `{ tenant_id, key }` for the authenticated tenant. 401 when `getAuthContext()` fails, 400 on missing key, 500 on Supabase error. |

### Content / Assets

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/admin/assets/upload` | POST | Multipart upload for documents (PDF, DOCX, TXT). Extracts text via Anthropic (PDF) or mammoth (DOCX) or direct Buffer read (TXT), inserts a `content` row with `type: 'document'`, uploads the original binary to the Supabase Storage `assets` bucket at `{tenant_id}/{content_id}/{filename}`, and updates the content record with the storage path. |
| `/api/admin/content` | POST | Creates a content row from structured input. |
| `/api/admin/content/[id]` | GET | Returns a single content record by id, tenant-scoped. Used to fetch uploaded document raw text. |
| `/api/admin/topics` | GET, POST | Lists and creates topics for the authenticated tenant. |

### Public

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/sage` | POST | Public visitor chat. Resolves tenant via `getTenantFromRequest(req)`, reads the highest-version `master_prompt` row for that tenant, and — when a tenant is resolved — also fetches all `sage_parameters` rows for that tenant and appends a "Booking cards" section to the system prompt containing one `[BOOKING: label \| description \| cta_label \| url]` line per parameter. Section is omitted when no parameters exist. Also accepts an optional `mode` field in the request body; when `mode === 'question'`, appends the `QUESTION_MODE_CONTEXT` string to the end of the system prompt (after the booking section) so Sage skips the name-ask/discovery phase and answers directly. The master prompt content itself is never modified — question mode is additive context only. All other modes (absent, unknown) leave the prompt unchanged. Streams the Anthropic response. Falls back to `DEFAULT_SYSTEM_PROMPT` when no tenant is resolved or no master_prompt row exists. |
| `/api/sage/parameters` | GET | Public read for the visitor chat renderer. Resolves tenant via `getTenantFromRequest(req)` and returns `[{ key, label, description, cta_label, url, open_as, embed_code }]` for that tenant (no admin fields, no `value`). Returns `[]` when no tenant is resolved or on DB error — never 4xx/5xx so client rendering stays resilient. Consumed by `src/components/Chat.tsx` to resolve `open_as` / `embed_code` for each parsed `[BOOKING: ...]` card by URL match. |

---

## Booking Card Syntax

Sage outputs booking cards using a specific bracket syntax that the
visitor chat parses at render time. This syntax is the contract between
the server-side system prompt injection and the client-side renderer —
changing the format requires updating both ends.

**Format:** `[BOOKING: label | description | cta_label | url]`

- One card per line, placed on its own line at the end of the assistant
  message — never inline within prose, never mid-message.
- `label`, `description`, `cta_label`, and `url` correspond to the
  `sage_parameters` columns of the same name.

**Server injection** (`app/api/sage/route.ts`): When a tenant is resolved,
the route fetches all `sage_parameters` rows for the tenant and appends
a "Booking cards" section to the system prompt containing the format
rules plus one `[BOOKING: ...]` line per available parameter. The section
is omitted when the tenant has no parameters.

**Client parsing** (`parseBookingCards` in `src/components/Chat.tsx`):
Runs a regex over each assistant message, extracts every completed
`[BOOKING: ...]` match into a typed `BookingCardData` list, strips any
trailing incomplete `[BOOKING:` fragment still streaming, collapses
leftover blank lines, and returns `{ prose, cards }`. The prose renders
via `ReactMarkdown` inside the assistant bubble; each card renders as a
`BookingCard` (Tailwind, white background, `#2d6a4f` CTA) below the
bubble in the assistant-aligned column.

**Open behavior** (`open_as` / `embed_code`): The bracket syntax only
carries `label | description | cta_label | url` — `open_as` and
`embed_code` are intentionally excluded (embed snippets contain HTML/JS
with characters that'd break pipe delimiting, and we don't want the LLM
copying them verbatim). Instead, Chat.tsx fetches `/api/sage/parameters`
on mount and matches each parsed card to a parameter by `url`:
- `open_as = 'new_tab'` (default): CTA renders as an `<a target="_blank" rel="noopener noreferrer">`.
- `open_as = 'popup'` (admin label "Inline") with non-empty `embed_code`:
  CTA renders as a `<button>`, and directly below the card there is a
  hidden ref'd container (`mt-2 w-full min-h-[700px]`). On click, the
  container is revealed and `injectInlineEmbed(container, embedCode)`
  re-materializes the snippet into live `<script>` / `<link>` nodes
  scoped to that container (setting `innerHTML` alone does not execute
  `<script>` tags). Handles both pure inline JS and HTML-with-
  `<script src="...">` fragments (e.g. Calendly's inline-widget
  snippet). The button disables itself after injection so subsequent
  clicks don't remount the widget.
- `open_as = 'popup'` with empty `embed_code`: falls back to new-tab
  behavior and `console.warn`s.

**Terminology note**: The DB value is still `'popup'` for historical
reasons, but the admin label and visitor-facing behavior are both
"Inline" — the embed renders directly below the booking card, not in a
popup overlay. Renaming the DB value would require a migration; the
label-only rename keeps the column untouched.

---

## Database Schema

All tables are multi-tenant. Every data access must respect `tenant_id`.
Row Level Security is enforced at the Supabase layer.

| Table | Key Columns |
|-------|-------------|
| `tenants` | id, parent_id, name, slug, type, settings, domain (text) |
| `tenant_users` | tenant_id, user_id, role |
| `users` | id, clerk_id, email, name |
| `blocks` | id, topic_id, owner_id, tenant_id, type, title, body, active, status (text default 'active': 'active' \| 'disabled' \| 'deleted'), order (integer, nullable — actively used: within each type, blocks with `order > 0` sort ascending by order, blocks with `order` = 0 or null sort last by title ascending; consumed by `/api/admin/prompt/compile` and the Blocks page inline Order input), is_default (bool default false), default_edited_at (timestamptz), default_edited_by (uuid references users(id)), default_action (text: 'edited' \| 'deleted'), default_acknowledged (bool default false), default_acknowledged_at (timestamptz) |
| `topics` | id, tenant_id, type, name |
| `content` | id, owner_id, tenant_id, block_id, type, name, raw, storage_path |
| `chat_sessions` | id, tenant_id, visitor_name, messages, status, message_count, session_type (text default 'prospect': 'prospect' \| 'composer' \| 'client'), session_subtype (text nullable: 'block' \| 'wizard'), block_id (uuid references blocks(id)) |
| `chat_corrections` | id, session_id, tenant_id, block_id, jeff_note |
| `do_not_engage` | id, owner_id, tenant_id, content, version |
| `master_prompt` | id, tenant_id, content, version, safety_check_result, updated_at (timestamptz), last_safety_check (timestamptz) |
| `master_prompt_history` | id, prompt_id, tenant_id, content, version |
| `sage_parameters` | id (uuid), tenant_id (uuid), key (text), value (text — legacy, not surfaced in UI), label (text — card title), description (text, max 60 chars — card subtitle), cta_label (text, max 20 chars — button text), url (text — booking URL), open_as (text default 'new_tab': 'new_tab' \| 'popup' — controls how the CTA opens on the visitor chat booking card), embed_code (text, nullable — JS/HTML snippet executed on click when `open_as = 'popup'`; ignored otherwise), updated_at (timestamptz). Unique constraint on (tenant_id, key). |

**Deployment note — tenant_id backfill required**: `master_prompt` and
`master_prompt_history` rows must have `tenant_id` populated before
tenant-scoped reads return data. Routes that scope by `tenant_id`
(notably `/api/sage/route.ts`, `/api/admin/prompt/save/route.ts`, and
`/api/admin/prompt/compile/route.ts`) will silently fall back to
`DEFAULT_SYSTEM_PROMPT` (Sage public chat) or treat the tenant as
having no existing prompt (admin save/compile) if existing rows were
inserted before the column was enforced. Backfill existing rows on
deploy.

### Block Types

| Type | Purpose |
|------|---------|
| `identity` | Identity & Voice — who Sage is, tone, personality |
| `knowledge` | Factual context about the business, owner, services |
| `guardrail` | Rules and constraints on Sage's behavior |
| `process` | Step-by-step instructions for how Sage should handle situations |
| `escalation` | When and how to route to a human or off-ramp |

**Compile order**: Types are compiled into the master prompt in this
fixed order: guardrail (1st), identity (2nd), process (3rd), knowledge
(4th), escalation (5th). Within each type, blocks with `order > 0` come
first ascending by `order`; blocks with `order` = 0 or null come last,
ordered by title ascending. This order is enforced in
`/api/admin/prompt/compile` and encoded in `BlocksTable.tsx`
`TYPE_LABELS` — do not change without updating both.

---

## Definition of Done

A task is complete when all of the following are true:

- [ ] Feature works as specified
- [ ] Mobile responsive verified
- [ ] Test plan written before implementation and passing
- [ ] No design system inconsistencies (Mantine admin / Tailwind public)
- [ ] Accessibility checked — semantic HTML, keyboard nav, color contrast
- [ ] Error states handled with on-brand messaging
- [ ] Performance targets not regressed
- [ ] No TypeScript errors (strict mode)
- [ ] Documentation updated — README and/or PRD reflect the change
- [ ] Branch pushed and ready for review
