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

## Database Schema

All tables are multi-tenant. Every data access must respect `tenant_id`.
Row Level Security is enforced at the Supabase layer.

| Table | Key Columns |
|-------|-------------|
| `tenants` | id, parent_id, name, slug, type, settings |
| `tenant_users` | tenant_id, user_id, role |
| `users` | id, clerk_id, email, name |
| `blocks` | id, topic_id, owner_id, tenant_id, type, title, body, active, order |
| `topics` | id, tenant_id, type, name |
| `content` | id, owner_id, tenant_id, block_id, type, name, raw, storage_path |
| `chat_sessions` | id, tenant_id, visitor_name, messages, status, message_count |
| `chat_corrections` | id, session_id, tenant_id, block_id, jeff_note |
| `do_not_engage` | id, owner_id, tenant_id, content, version |
| `master_prompt` | id, tenant_id, content, version, safety_check_result |
| `master_prompt_history` | id, prompt_id, tenant_id, content, version |

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
