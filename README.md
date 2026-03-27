# Natural Resource — jefflougheed.ca

Jeff Lougheed's coaching and embedded operator practice. Performance-driven, heart-led.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + CSS custom properties |
| State | Zustand |
| AI | Anthropic claude-sonnet-4-6 via Vercel AI SDK |
| Database | Supabase (client configured; schema TBD) |
| Deployment | Vercel (auto-deploy on push to `main`) |

## Features

**Sage AI chat assistant**
- Full-viewport expanding overlay with streaming responses
- Secure server-side API route (`app/api/sage/route.ts`) — `ANTHROPIC_API_KEY` never reaches the browser
- Greeting flow, conversation history, Escape to close, body scroll lock
- Accessible from Hero ("Ask a Question"), Nav ("Chat"), and the Chat section CTA

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
# Server-only — never expose to the browser
ANTHROPIC_API_KEY=

# Public — Supabase client (browser + server)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Set all three in Vercel under **Project Settings → Environment Variables**. `ANTHROPIC_API_KEY` should be set to **Server** environment only.

## Project structure

```
app/
  api/sage/route.ts   # Streaming Anthropic API route (server-only)
  favicon.ico         # Auto-served by Next.js at /favicon.ico
  globals.css         # Design tokens, reset, reveal animation
  layout.tsx          # Root layout — fonts, Calendly, metadata
  page.tsx            # Page assembly

public/
  favicon.ico / .svg / favicon-96x96.png
  apple-touch-icon.png
  web-app-manifest-192x192.png / 512x512.png
  site.webmanifest
  logos/              # Trapeze, Infor, Keyhole, MealGarden
  ProblemBackground.webp

src/
  components/
    Chat.tsx              # Sage UI — section always in DOM, overlay on top
    Nav.tsx / Hero.tsx    # Both call useSageStore.expand() on "Chat" click
    Problem.tsx / WhyMe.tsx / Work.tsx / Session.tsx / Footer.tsx
    TestimonialCarousel.tsx / QuoteCarouselSection.tsx / CareerTimeline.tsx
  hooks/
    useReveal.ts          # IntersectionObserver scroll-reveal
  lib/
    sage.ts               # streamSageResponse() — fetches /api/sage, parses data stream
    store.ts              # useSageStore (Sage UI) + useChatStore (legacy)
    ai.ts                 # Legacy direct Anthropic client (unused by Sage)
```

## Branch structure

| Branch | Purpose |
|--------|---------|
| `main` | Production — auto-deploys to jefflougheed.ca |
| `sage-v1` | Sage AI feature branch — merged into main |

## Deployment

Vercel is connected to this repository. Every push to `main` triggers a production deployment. PRs and branches get preview URLs automatically.

`vercel.json` explicitly sets `"framework": "nextjs"` and `"outputDirectory": ".next"`.

## Roadmap

- **Admin layer** — view Sage conversation logs, visitor intent signals
- **Chat persistence** — store conversations in Supabase, resume on return visit
- **Setup wizard** — onboarding flow for new visitors with high intent
- **RAG pipeline** — ground Sage responses in Jeff's actual content (case studies, methodology docs)
