# Natural Resource — jefflougheed.ca

Personal site for Jeff Lougheed's coaching and embedded operator practice.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | React 19, TypeScript, Tailwind CSS |
| Auth | Clerk |
| Database | Supabase (PostgreSQL) |
| AI | Anthropic API (`claude-sonnet-4-6`) |
| Hosting | Vercel |

---

## Design Tokens

| Token | Value |
|---|---|
| Background | `#f9f8f5` |
| Accent green | `#2d6a4f` |
| Text primary | `#1a1917` |
| Text muted | `rgba(26,25,23,0.55)` |
| Font — display | Playfair Display |
| Font — body | DM Sans |
| Font — mono | DM Mono |

---

## Site Sections

| Section | Notes |
|---|---|
| Nav | Two links: Schedule (`#work`), Chat. Mobile hamburger. |
| Hero | Headline, subhead, CTA to `#work`. |
| Problem | Full-bleed section with background image. Mobile: `flex-direction: column`, image anchors top. |
| How I Operate | Headline + body (full width), then two-column split: Principles in Practice (5 items) + Career Highlights carousel. |
| Career Highlights | `TestimonialCarousel` — intro card + company cards with expandable detail. |
| Work / Services | Two service cards (1-on-1 Coaching, Embedded Execution). Calendly inline embed. Cards flex-column so buttons pin to bottom. |
| Chat (Sage) | Public AI chat. Expands to full-screen overlay. See Sage section below. |
| Footer | Nav links: About, Work, Chat. |

---

## Sage — Public AI Chat

`src/components/Chat.tsx` + `app/api/sage/route.ts`

- Powered by `claude-sonnet-4-6` via `streamText` + `toDataStreamResponse`
- Vercel AI SDK data stream format (`0:"delta"\n`)
- Streaming with typing indicator (three dots before first token)
- Markdown rendering via `react-markdown` (bold, bullets, headers, code)
- Enter to send, Shift+Enter for newline
- Error state with retry button
- Mobile: `visualViewport` listener resizes overlay on keyboard open/close — smooth transition via CSS
- Empty state: "Hello." centered in Playfair Display
- System prompt loaded from `master_prompt` table in Supabase; falls back to `DEFAULT_SYSTEM_PROMPT`

---

## Admin

Protected at `/admin` via Clerk middleware.

### Sessions — `/admin/sessions`
Viewer for visitor chat history stored in `chat_sessions`.

### Prompt — `/admin/prompt`
View and activate the current master system prompt. Reads from `master_prompt` table.

### Prompt Builder — `/admin/prompt-builder`

Three canvases (URL param `?canvas=`):
- `guardrails` — hard rules, compiled first
- `knowledge` — what Sage knows
- `prompts` — voice, behavior, conversion logic

Each canvas contains topics with blocks. Block types: `text`, `url`, `doc`, `wizard`.

**Chat Assistant overlay** (`components/admin/PromptBuilderChat.tsx` + `app/api/admin/prompt-chat/route.ts`)
- Fixed gradient banner (blue → purple) at page bottom
- Opens centered modal with backdrop blur
- Reads full current block state on every message (serialized into system prompt)
- AI can suggest blocks; user confirms before they're added
- `addBlockAnywhere()` searches all canvases by topic ID — safe regardless of active canvas

---

## Database (Supabase)

| Table | Purpose |
|---|---|
| `users` | Clerk auth integration |
| `chat_sessions` | Visitor conversations with Sage |
| `master_prompt` | Current active system prompt (versioned) |
| `master_prompt_history` | Previous prompt versions |
| `content` | Raw material — documents, images, URLs, text |
| `blocks` | Processed prompt / knowledge / guardrail blocks |
| `chat_corrections` | Corrective feedback on Sage responses |
| `do_not_engage` | Off-ramp triggers for Sage |

---

## Environment Variables

```
ANTHROPIC_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

---

## Key Principles

- One change at a time, confirmed before proceeding
- TypeScript strict mode throughout
- Mobile-first — minimum 16px font, spacing in multiples of 4px
- Push directly to `main` unless otherwise specified

---

## What was built (April 7, 2026)

### Composer (Prompt Builder)
- Block creation chat wired end-to-end
- AI guides block creation, suggests type and topic
- Confirmation card with inline editable type, topic, block name
- is_default toggle for platform admins (Clerk publicMetadata.role)
- Blocks save to Supabase with auto-created content record
- Composer conversation saved to chat_sessions linked to block
- Post-save continuation — "Block saved! What would you like to build next?"
- Exchange counter, max-width 800px, auto-focus after send

### Blocks Page
- /admin/prompt-studio/blocks — lists all blocks with type badges and topics

### History Page
- /admin/prompt-studio/history — lists all composer sessions linked to blocks

### Schema changes
- blocks: is_default, default audit columns, updated type constraint
- chat_sessions: session_type, session_subtype, block_id, owner_id
- content: added wizard type
