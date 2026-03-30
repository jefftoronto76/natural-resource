# Natural Resource — jefflougheed.ca

Jeff Lougheed's coaching and embedded operator practice. Performance-driven, heart-led.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + CSS custom properties |
| State | Zustand |
| AI | Anthropic claude-sonnet-4-6 via Vercel AI SDK |
| Auth | Clerk (Google, Apple, phone, email) |
| Database | Supabase (Postgres + RLS) |
| Deployment | Vercel (auto-deploy on push to `main`) |

## Features

**Sage AI chat assistant**
- Full-viewport expanding overlay with streaming responses
- Secure server-side API route (`app/api/sage/route.ts`) — `ANTHROPIC_API_KEY` never reaches the browser
- Greeting flow, conversation history, Escape to close, body scroll lock
- Accessible from Hero ("Ask a Question"), Nav ("Chat"), and the Chat section CTA
- Every conversation saved to `chat_sessions` in Supabase on first user message, updated after each reply

**Admin layer** (`/admin` — Clerk-protected)
- Sessions list — visitor name, message count, status, last active timestamp
- Session transcript view — full conversation with Visitor/Sage labels
- System prompt editor — edit Sage's instructions with Claude safety check before saving
  - Safety check flags issues with exact offending text + one-click removal
  - "Save Anyway" override available
  - Version history with Restore — previous versions archived to `master_prompt_history`
- Sage reads the active prompt from `master_prompt` on every request, falls back to hardcoded default

**Site sections**
Nav → Hero → Problem → WhyMe (TestimonialCarousel, QuoteCarouselSection) → Work → Chat → Footer

Session section is built and ready; currently commented out in `app/page.tsx`.

## Local development

```bash
npm install
cp .env.local.example .env.local   # fill in credentials
npm run dev                          # http://localhost:3000
npm run build                        # production build
```

## Environment variables

```env
# Server-only
ANTHROPIC_API_KEY=
CLERK_SECRET_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Public
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
```

Set all in Vercel under **Project Settings → Environment Variables**. `ANTHROPIC_API_KEY`, `CLERK_SECRET_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` should be **Server** environment only.

## Project structure

```
app/
  admin/
    layout.tsx                  # Admin shell — nav, UserButton
    page.tsx                    # Sessions list (server, service-role Supabase)
    prompt/page.tsx             # System prompt editor (server wrapper)
    sessions/[id]/page.tsx      # Session transcript (server)
  api/
    admin/prompt/check/route.ts # Safety check via Claude generateText
    admin/prompt/save/route.ts  # Upsert master_prompt, archive to history
    sage/route.ts               # Streaming Anthropic API route (server-only)
    sessions/route.ts           # POST — create chat_sessions row
    sessions/[id]/route.ts      # PATCH — update messages + visitor_name
  favicon.ico
  globals.css                   # Design tokens, reset, reveal animation
  layout.tsx                    # Root layout — ClerkProvider, fonts, Calendly, metadata
  page.tsx                      # Page assembly

middleware.ts                   # Clerk — protects /admin routes

public/
  favicon.ico / .svg / favicon-96x96.png
  apple-touch-icon.png
  web-app-manifest-192x192.png / 512x512.png
  site.webmanifest

src/
  components/
    Chat.tsx              # Sage UI — section always in DOM, overlay on top
    PromptEditor.tsx      # Client component — textarea, check/save, version history
    Nav.tsx / Hero.tsx    # Both call useSageStore.expand() on "Chat" click
    Problem.tsx / WhyMe.tsx / Work.tsx / Session.tsx / Footer.tsx
    TestimonialCarousel.tsx / QuoteCarouselSection.tsx / CareerTimeline.tsx
  hooks/
    useReveal.ts          # IntersectionObserver scroll-reveal
  lib/
    sage.ts               # streamSageResponse() — fetches /api/sage, parses data stream
    sage-prompt.ts        # DEFAULT_SYSTEM_PROMPT constant (shared fallback)
    store.ts              # useSageStore (Sage UI + sessionId) + useChatStore (legacy)
    supabase.ts           # Browser Supabase client (anon key)
    supabase-server.ts    # Server Supabase client (anon key + cookies, SSR)
    supabase-admin.ts     # Server Supabase client (service-role key, bypasses RLS)
```

## Supabase schema

```sql
-- Sage conversation sessions
chat_sessions (
  id uuid primary key,
  created_at timestamptz,
  updated_at timestamptz,
  visitor_name text,
  messages jsonb,           -- array of { id, role, content, timestamp }
  status text,              -- 'active' | 'completed' | 'flagged'
  stop_reason text,
  corrective_feedback jsonb
)

-- Active system prompt (single row)
master_prompt (
  id uuid primary key,
  content text,
  version int4,
  last_safety_check timestamptz,
  safety_check_result jsonb,
  updated_at timestamptz
)

-- Prompt version archive
master_prompt_history (
  id uuid primary key,
  content text,
  version int4,
  safety_check_result jsonb,
  created_at timestamptz
)
```

RLS is enabled on all tables. Admin reads/writes use the service-role key (bypasses RLS). Public chat session writes use the service-role key via server-side API routes.

## Branch structure

| Branch | Purpose |
|--------|---------|
| `main` | Production — auto-deploys to jefflougheed.ca |
| `sage-v1` | Sage AI feature branch — merged into main |
| `admin-v1` | Phase 2 admin layer — merged into main |

## Deployment

Vercel is connected to this repository. Every push to `main` triggers a production deployment. PRs and branches get preview URLs automatically.

`vercel.json` explicitly sets `"framework": "nextjs"`, `"buildCommand": "next build"`, `"outputDirectory": ".next"`, and `"installCommand": "npm install"`.

## Roadmap

- **Corrective feedback** — flag and annotate specific Sage responses from session transcript view
- **Chat persistence** — resume conversations on return visit via sessionId in localStorage
- **Setup wizard** — onboarding flow for new visitors with high intent
- **RAG pipeline** — ground Sage responses in Jeff's actual content (case studies, methodology docs)
