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
| `PromptFullnessMeter` | `PromptFullnessMeter.tsx` | Takes `bodies: string[]`, sums character counts, approximates tokens as `ceil(chars/4)`, renders a Mantine `Progress` bar with a monospace label. Color thresholds: green under 3000 tokens, yellow 3000–4000, red over 4000. Used on the Blocks page (reactive to the client-side items state) and the Prompt page (server-fetched on mount). |

### Page-local components

| Component | File | Purpose |
|-----------|------|---------|
| `SageParameters` | `app/admin/settings/SageParameters.tsx` | Mantine-based client component rendered inside the Parameters section on the Settings page. Fetches `/api/admin/sage-parameters` on mount, renders each parameter as a labeled `TextInput` + Save button, and a bottom "Add parameter" form (label + value + Add). Save and Add both PATCH `/api/admin/sage-parameters`; Add auto-generates `key` from the label (lowercase, non-alphanumerics collapsed to `_`). Surfaces success/error via `@mantine/notifications`. Section heading and description are owned by the page, not the component. |

---

## Pages

Admin page routes under `app/admin/`. Each page owns its route header
and section scaffolding; data fetching lives in server components or
page-local client components.

| Page | File | Purpose |
|------|------|---------|
| Settings | `app/admin/settings/page.tsx` | Tenant configuration. Currently contains the Parameters section rendering the `SageParameters` component. |

---

## Utilities

Shared helpers in `src/lib/`:

| Helper | File | Purpose |
|--------|------|---------|
| `getAuthContext` | `get-auth-context.ts` | Resolves the current Clerk user to their Supabase `owner_id` and `tenant_id` via the `users.clerk_id` → `tenant_users.user_id` lookup. Throws `Unauthorized` / `User not found` / `Tenant not found` on failure. Used by every authenticated admin API route for tenant scoping. |
| `getTenantFromRequest` | `get-tenant-from-request.ts` | Resolves `tenant_id` from the `Host` header of an anonymous public request. Strips subdomains to the root domain (e.g. `app.jefflougheed.ca` → `jefflougheed.ca`), filters dev hosts (localhost, `*.local`, `127.0.0.1`), queries `tenants.domain` for a match. Returns `tenant_id` string or `null`. Used by `/api/sage/route.ts` for anonymous visitor chat — falls back to `DEFAULT_SYSTEM_PROMPT` on null. |

---

## API Routes

Admin routes all call `getAuthContext()` first and scope Supabase
queries by `tenant_id`. Public routes resolve tenant via the Host
header.

### Prompt compilation

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/admin/prompt/compile` | POST | Compiles all active blocks for the authenticated tenant into the master prompt. Orders by compile sequence (guardrail → identity → process → knowledge → escalation), then by `order` column ascending within each type. Joins bodies with double newlines. Archives the previous `master_prompt` row to `master_prompt_history` and increments the version. Returns `{ success, version, tokenCount, content, updatedAt }`. |
| `/api/admin/prompt/compile/check` | POST | LLM-based safety review of a single block body. Takes `{ body: string }`, returns `{ ok: boolean, issues: [{ description: string, offendingText: string \| null }] }`. Server-side verbatim guard: every returned `offendingText` is validated against `body.includes()` and nulled if not a real substring. Fails open to `{ ok: true, issues: [] }` on any error so the save flow is never blocked. |
| `/api/admin/prompt/save` | POST | Manual save path for the master prompt (legacy). Takes `{ prompt, checkResult }`, tenant-scoped, archives previous version to history, increments version. |
| `/api/admin/prompt/check` | POST | Safety check for an entire system prompt (legacy, used by the old prompt save flow). Returns `{ pass, issues }`. |

### Blocks

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/admin/blocks` | GET | Returns active blocks (`id, title, type, body, is_default`) for the authenticated tenant. Filters `active = true`, ordered by type then title. Used for the Composer's existing-blocks context. |
| `/api/admin/blocks/[id]` | PATCH | Updates block `status` or `body`. Validates status against `'active' \| 'disabled' \| 'deleted'`. Keeps the legacy `active` boolean in sync with `status` so the Composer GET doesn't surface disabled or deleted blocks. Tenant-scoped via `.eq('tenant_id', authCtx.tenant_id)`. |
| `/api/admin/blocks/save` | POST | Creates a new block from the Composer draft confirmation flow. |
| `/api/admin/blocks/chat` | POST | Streaming chat route for the Composer. Accepts `{ type, topic, content, messages, documentContext?, existingBlocks? }`. Returns a Vercel AI SDK data stream. |

### Sage Parameters

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/admin/sage-parameters` | GET | Returns all `sage_parameters` rows (`id, tenant_id, key, value, label, updated_at`) for the authenticated tenant, ordered by `key`. 401 when `getAuthContext()` fails. |
| `/api/admin/sage-parameters` | PATCH | Upserts a single parameter for the authenticated tenant. Accepts `{ key, value, label }` (all strings). Upsert uses `onConflict: 'tenant_id, key'` and stamps `updated_at` on write. 401 when `getAuthContext()` fails, 400 on invalid body. |

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
| `/api/sage` | POST | Public visitor chat. Resolves tenant via `getTenantFromRequest(req)`, reads the highest-version `master_prompt` row for that tenant, streams the Anthropic response. Falls back to `DEFAULT_SYSTEM_PROMPT` when no tenant is resolved or no master_prompt row exists. |

---

## Database Schema

All tables are multi-tenant. Every data access must respect `tenant_id`.
Row Level Security is enforced at the Supabase layer.

| Table | Key Columns |
|-------|-------------|
| `tenants` | id, parent_id, name, slug, type, settings, domain (text) |
| `tenant_users` | tenant_id, user_id, role |
| `users` | id, clerk_id, email, name |
| `blocks` | id, topic_id, owner_id, tenant_id, type, title, body, active, status (text default 'active': 'active' \| 'disabled' \| 'deleted'), order, is_default (bool default false), default_edited_at (timestamptz), default_edited_by (uuid references users(id)), default_action (text: 'edited' \| 'deleted'), default_acknowledged (bool default false), default_acknowledged_at (timestamptz) |
| `topics` | id, tenant_id, type, name |
| `content` | id, owner_id, tenant_id, block_id, type, name, raw, storage_path |
| `chat_sessions` | id, tenant_id, visitor_name, messages, status, message_count, session_type (text default 'prospect': 'prospect' \| 'composer' \| 'client'), session_subtype (text nullable: 'block' \| 'wizard'), block_id (uuid references blocks(id)) |
| `chat_corrections` | id, session_id, tenant_id, block_id, jeff_note |
| `do_not_engage` | id, owner_id, tenant_id, content, version |
| `master_prompt` | id, tenant_id, content, version, safety_check_result, updated_at (timestamptz), last_safety_check (timestamptz) |
| `master_prompt_history` | id, prompt_id, tenant_id, content, version |
| `sage_parameters` | id (uuid), tenant_id (uuid), key (text), value (text), label (text), updated_at (timestamptz). Unique constraint on (tenant_id, key). |

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
(4th), escalation (5th). Within each type, blocks are ordered by the
`order` column ascending. This order is enforced in
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
