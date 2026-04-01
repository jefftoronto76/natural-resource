# jefflougheed.ca — Natural Resource

Personal site for Jeff Lougheed's coaching and consulting practice, Natural Resource.

**Live site:** jefflougheed.ca

---

## Stack

- **Framework:** Next.js 15 App Router + TypeScript
- **Styling:** Tailwind CSS
- **AI:** Anthropic Claude (claude-sonnet-4-20250514) via Vercel AI SDK
- **Auth:** Clerk (protects /admin routes)
- **Database:** Supabase (chat sessions, system prompts, admin data)
- **Deployment:** Vercel (auto-deploy from main branch)
- **Booking:** Calendly embed (working session + discovery call)

---

## Design Tokens

| Token | Value |
|-------|-------|
| Background | #f9f8f5 |
| Accent green | #2d6a4f |
| Text primary | #1a1917 |
| Text muted | rgba(26,25,23,0.55) |
| Font display | Playfair Display |
| Font body | DM Sans |
| Font mono | DM Mono |
| Min font size | 16px (labels/mono: 11px) |
| Spacing | Multiples of 4px |

---

## Site Sections

| Section | Description |
|---------|-------------|
| Nav | Logo left, links right (About, Work, Session, Chat) |
| Hero | Headline, subhead, CTAs |
| Problem | "The Work" — photo background section |
| Why Me | 4 paragraphs + stats carousel with 4 company cards + quotes |
| Work | Two service lanes — 1-on-1 Coaching + Embedded Execution |
| Session | Inline Calendly embed (working session) |
| Chat | Sage AI assistant |
| Footer | Brand + nav links |

---

## Key Files

| Path | Purpose |
|------|---------|
| `/app/page.tsx` | Main site page |
| `/app/api/sage/route.ts` | Sage AI API route |
| `/app/admin/` | Admin dashboard (Clerk protected) |
| `/lib/sage-prompt.ts` | Default system prompt fallback |
| `/lib/supabase-admin.ts` | Supabase admin client |

---

## Environment Variables

```
ANTHROPIC_API_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```
