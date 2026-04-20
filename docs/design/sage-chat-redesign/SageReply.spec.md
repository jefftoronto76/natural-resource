# SageReply — Component Spec (v2, Tailwind)

Drop-in component for `src/components/Chat.tsx`. Add above the `Chat` export.

---

## Contract

**Purpose:** render a streamed Sage assistant reply as typographic prose with a green left rule, and delegate booking cards to the existing `<BookingCard>` component.

**Props**

| Prop | Type | Notes |
|---|---|---|
| `prose` | `string` | Result of `parseBookingCards(msg.content).prose`. May be empty while streaming. |
| `cards` | `BookingCardData[]` | Result of `parseBookingCards(msg.content).cards`. Verbatim pass-through to `<BookingCard>`. |
| `sageParameters` | `SageParameterPublic[]` | Fetched once by `Chat` from `/api/sage/parameters`. Used to resolve `open_as` + `embed_code` per card by URL match. |

**Preconditions**
- `BookingCardData`, `SageParameterPublic`, `OpenAs`, `BookingCard`, and `markdownComponents` already exist in `Chat.tsx` above the `Chat` export.
- `ReactMarkdown` is imported.
- Tailwind config exposes aliases `bg-accent`, `border-accent`, `text-accent`, `font-display`; CSS vars `--color-text-primary`, `--color-bg` are defined in `app/globals.css`.
- `@keyframes sage-slide-up` exists in `app/globals.css` (see PATCH_PLAN 1).

**Postconditions**
- Renders nothing if `prose` is empty **and** `cards.length === 0` (caller already guards this; component self-guards too for safety).
- Does not render or suppress error-state content. Caller continues to handle `isError` separately.
- Does not mutate props.

---

## Source

```tsx
function SageReply({
  prose,
  cards,
  sageParameters,
}: {
  prose: string
  cards: BookingCardData[]
  sageParameters: SageParameterPublic[]
}) {
  if (!prose && cards.length === 0) return null

  return (
    <div
      data-sage-role="assistant"
      className="sage-animate max-w-[680px] border-l-2 border-accent/35 pl-4 [animation:sage-slide-up_0.28s_ease-out_both]"
    >
      {prose && (
        <div className="font-display text-[18px] font-normal leading-[1.55] tracking-[-0.005em] text-[color:var(--color-text-primary)] [text-wrap:pretty]">
          <ReactMarkdown components={markdownComponents}>{prose}</ReactMarkdown>
        </div>
      )}

      {cards.length > 0 && (
        <div className="mt-3 flex w-full flex-col gap-2">
          {cards.map((card, i) => {
            const match = sageParameters.find((p) => (p.url ?? '') === card.url)
            return (
              <BookingCard
                key={`${card.url}-${i}`}
                {...card}
                openAs={match?.open_as ?? 'new_tab'}
                embedCode={match?.embed_code ?? null}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
```

---

## Class-by-class rationale

### Container
`sage-animate max-w-[680px] border-l-2 border-accent/35 pl-4 [animation:sage-slide-up_0.28s_ease-out_both]`

- `sage-animate` — targeted by the reduced-motion guard in `app/globals.css`, so the entry animation disables automatically.
- `max-w-[680px]` — reading measure; narrower than visitor messages (`max-w-[560px]`) so Sage's prose has room to breathe in a two-column rhythm on wide viewports.
- `border-l-2 border-accent/35` — 2px left rule in the sage-green accent token at 35% opacity. Opacity modifier is valid Tailwind; resolves to `rgb(var(--color-accent) / 0.35)` — verify the token is declared as `rgb()` components (not a hex), otherwise fall back to `border-[color:color-mix(in_srgb,var(--color-accent)_35%,transparent)]`.
- `pl-4` — 16px gap between the rule and the prose.
- `[animation:sage-slide-up_0.28s_ease-out_both]` — arbitrary-value shorthand targets the `sage-slide-up` keyframes added in PATCH_PLAN 1. `both` so the `opacity: 0 / translateY(6px)` starting frame persists until the animation runs.

### Prose
`font-display text-[18px] font-normal leading-[1.55] tracking-[-0.005em] text-[color:var(--color-text-primary)] [text-wrap:pretty]`

- `font-display` — Playfair, via the `fontFamily.display` alias in `tailwind.config.js`.
- `text-[18px] leading-[1.55] tracking-[-0.005em]` — calm typographic voice; tightened tracking counters Playfair's native airiness at body size.
- `text-[color:var(--color-text-primary)]` — `--color-text-primary` is not a Tailwind alias, so arbitrary value is used.
- `[text-wrap:pretty]` — better line breaks for prose. Graceful fallback: unsupported browsers ignore it.

### Cards wrapper
`mt-3 flex w-full flex-col gap-2`

- `mt-3` — 12px breathing room between prose and the first card.
- `gap-2` — 8px between cards when multiple resolve at once.
- `w-full` — cards stretch to the container width (which is capped at 680px).

### Card instance
`<BookingCard {...card} openAs={...} embedCode={...} />`

- **Pass-through.** Every key from `card` (label / description / ctaLabel / url) is spread verbatim. `openAs` and `embedCode` are resolved against `sageParameters` by URL match — exactly the logic the current assistant branch uses, copied 1:1.
- **No re-implementation.** The inline-embed injection (`injectInlineEmbed`), popup-vs-new-tab fallback, "opens in a new tab" heads-up, and `min-h-[700px]` embed container all live inside the existing `BookingCard` and are untouched.
- **Key:** `${card.url}-${i}` — URL + index disambiguates duplicate offers in the same reply without breaking reconciliation on streaming updates.

---

## Non-requirements

- **No bubble.** No `bg-*`, no `rounded-*`, no `shadow-*`, no border aside from the left rule.
- **No avatar / no "Sage" label.** The left rule is the entire identity marker. A separate label would fight the typographic voice.
- **No per-card headings.** The existing `BookingCard` already renders its own `label`.
- **No internal error handling.** The caller's `isError` path remains authoritative.
- **No fetching.** `sageParameters` is fetched once by `Chat` and passed in.

---

## Call site (for reference — see PATCH_PLAN 3.8 for the diff)

```tsx
{messages.map((msg) => {
  if (msg.role === 'assistant' && !msg.content) return null
  if (msg.role === 'user') { /* visitor branch, PATCH_PLAN 3.7 */ }
  const { prose, cards } = parseBookingCards(msg.content)
  if (!prose && cards.length === 0) return null
  return (
    <SageReply
      key={msg.id}
      prose={prose}
      cards={cards}
      sageParameters={sageParameters}
    />
  )
})}
```

The `{isError && !isStreaming && ...}` block immediately after this map stays in place — `SageReply` does not render error content. See PATCH_PLAN 3.9.
