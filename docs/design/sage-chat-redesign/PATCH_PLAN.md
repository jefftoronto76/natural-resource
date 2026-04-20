# Sage Chat Redesign — Patch Plan (v2, Tailwind)

**Repo:** `jefftoronto76/natural-resource`
**Branch:** create `feat/sage-chat-redesign` off `main`
**Files touched:** 4 (`app/globals.css`, `src/lib/store.ts`, `src/components/Chat.tsx`, `CLAUDE.md`)
**Posture:** edit-in-place, not rewrite. All existing effects, streaming, retry, booking-card pipeline, session PATCH, and question-mode detection are preserved.

**Deferred (do not land in this PR):**
- TODO-00 — starter chips
- TODO-01 — attach (+) button
- TODO-02 — mic morph

---

## Tailwind posture

CLAUDE.md specifies Tailwind for the public site. The current `Chat.tsx` is off-pattern with inline styles; this patch fixes that drift rather than compounding it. Every rewritten block in section 3 uses Tailwind classes. Token aliases available in `tailwind.config.js`:

- Colors: `bg-bg`, `bg-surface`, `bg-accent`, `text-accent` (aliased to `--color-bg` / `--color-surface` / `--color-accent`).
- Fonts: `font-display` (Playfair), `font-body` (DM Sans), `font-mono`.

For CSS vars **not** aliased (`--color-text-primary`, `--color-text-muted`, `--color-text-dim`, `--kb-h`, `--sage-scroll-y`), use Tailwind arbitrary values: `text-[color:var(--color-text-primary)]`, `pb-[max(12px,calc(env(safe-area-inset-bottom)+var(--kb-h)))]`, etc. Prefer aliases where they exist.

`BookingCard` is already Tailwind and passes through unchanged. `markdownComponents` at the top of `Chat.tsx` is inline-styled today — leave it alone in this patch; a follow-up can migrate it.

---

## Files touched

| File | Change | Notes |
|---|---|---|
| `app/globals.css` | edit (append) | Tokens, body-lock class, curly-quote rule, `sage-slide-up`, `sage-pulse`, reduced-motion guard. |
| `src/lib/store.ts` | no-op | Verify shape; no code changes. |
| `src/components/Chat.tsx` | edit in place | 13 diffs — imports, scroll lock, `--kb-h`, header, visitor/assistant/streaming/error branches, empty-state greeting, composer, tray padding, remove inline `<style>`, remove transcript preview, hook up `sage-pulse`. |
| `CLAUDE.md` | edit | Update public-site Chat row; note transcript-preview removal in `#chat` anchor section. See section 4. |

---

## Scope

### In scope
- Visual refresh of the overlay — compact header, typographic Sage voice with a 2px green left rule, italic-quote visitor replies (curly quotes via CSS).
- Replace the giant `Hello.` empty state with a mode-aware greeting. **This also becomes the greeting** — see `sendGreeting` removal (section 3.3).
- Keyboard-aware composer tray via `100dvh` + `visualViewport` (existing fallback preserved; now publishes `--kb-h`).
- CSS additions: `--kb-h`, body-lock helper, curly-quote rule, `sage-slide-up`, `sage-pulse`, reduced-motion guard.
- Remove the 240px inline transcript preview from the `#chat` anchor section.
- Migrate the inline-styled overlay JSX to Tailwind. Preserve `parseBookingCards`, `BookingCard`, `injectInlineEmbed`, `markdownComponents`, all effects, streaming, retry flow, session PATCH, and question-mode detection.

### Out of scope — do not touch
- `app/api/sage/route.ts` and the booking-card system-prompt injection.
- `parseBookingCards`, `injectInlineEmbed`, `BookingCard` internals.
- `sage_parameters` schema / admin UI.
- `useSageStore` shape.
- `markdownComponents` inline styles (follow-up).

### Guiding rule
Every change is locally reversible. If a visual detail fails review, revert inside `Chat.tsx` without touching the store, the CSS, or any route.

---

## 1 — `app/globals.css` (edit: append at end)

```css
/* ───────────────────────────────────────────────────────── */
/* Sage chat overlay — appended for visitor chat redesign   */
/* ───────────────────────────────────────────────────────── */

:root {
  --kb-h: 0px; /* keyboard inset, set by Chat.tsx on iOS < 17.4 */
}

/* Body scroll lock — preserves scroll position on close.
   Chat.tsx toggles this class instead of mutating overflow inline. */
body.sage-locked {
  position: fixed;
  top: var(--sage-scroll-y, 0);
  left: 0;
  right: 0;
  overflow: hidden;
  width: 100%;
}

/* Curly quotes on visitor messages. Applied via .sage-visitor-msg
   on the user-reply <p> in Chat.tsx. */
.sage-visitor-msg {
  quotes: "\201C" "\201D" "\2018" "\2019";
}
.sage-visitor-msg::before { content: open-quote; }
.sage-visitor-msg::after  { content: close-quote; }

/* Message entry animation. */
@keyframes sage-slide-up {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Streaming indicator dots (replaces inline `pulse` in Chat.tsx). */
@keyframes sage-pulse {
  0%, 100% { opacity: 0.2; transform: scale(0.8); }
  50%      { opacity: 1;   transform: scale(1.2); }
}

/* Respect reduced-motion at the CSS layer. */
@media (prefers-reduced-motion: reduce) {
  .sage-animate,
  .sage-visitor-msg,
  [data-sage-streaming] > * {
    animation: none !important;
    transition: none !important;
  }
}
```

> **Note:** the existing `@keyframes expandChat` is kept (see section 3.12) — still used for the overlay entry. We're only promoting `pulse` → `sage-pulse`.

---

## 2 — `src/lib/store.ts` (no-op)

Verify the existing `useSageStore` shape still includes all of these — it does per CLAUDE.md. **No edit.**

```ts
interface SageStore {
  messages: SageMessage[]
  visitorName: string | null
  hasGreeted: boolean
  isStreaming: boolean
  isExpanded: boolean
  mode: 'question' | null
  sessionId: string | null
  addMessage: (msg: Omit<SageMessage, 'id' | 'timestamp'>) => void
  updateLastMessage: (content: string) => void
  setVisitorName: (name: string) => void
  setGreeted: (greeted: boolean) => void
  setStreaming: (streaming: boolean) => void
  setSessionId: (id: string) => void
  expand: (mode?: 'question') => void
  collapse: () => void
  reset: () => void
}
```

`hasGreeted` and `setGreeted` stay in the store for now even though `sendGreeting` is removed (section 3.3). If nothing else reads them after the patch, a follow-up can clean them up.

---

## 3 — `src/components/Chat.tsx` (edit in place)

Thirteen diffs. Apply in order. Every `-` hunk matches the literal current code at `main` as of this writing.

### 3.1 — Imports

```diff
- import { useRef, useEffect, KeyboardEvent, useState } from 'react'
+ import { useRef, useEffect, useLayoutEffect, KeyboardEvent, useState } from 'react'
```

### 3.2 — Body scroll lock (exact "before" hunk)

The current effect has **three** `document.body.style.overflow` writes (set on open, reset on close, reset in cleanup) plus a call to `sendGreeting`. Replace the whole effect.

```diff
- useEffect(() => {
-   if (isExpanded) {
-     document.body.style.overflow = 'hidden'
-
-     if (!hasGreeted) {
-       sendGreeting()
-     }
-   } else {
-     document.body.style.overflow = ''
-   }
-
-   return () => {
-     document.body.style.overflow = ''
-   }
- }, [isExpanded])

+ useLayoutEffect(() => {
+   if (!isExpanded) return
+   const scrollY = window.scrollY
+   document.body.style.setProperty('--sage-scroll-y', `-${scrollY}px`)
+   document.body.classList.add('sage-locked')
+   return () => {
+     document.body.classList.remove('sage-locked')
+     document.body.style.removeProperty('--sage-scroll-y')
+     window.scrollTo(0, scrollY)
+   }
+ }, [isExpanded])
```

### 3.3 — Remove `sendGreeting` entirely (greeting-collision fix)

The empty state (section 3.8) **is** the greeting now. `messages.length === 0` is the greeting state; the first user `send` populates `messages` and the empty state swaps out.

**Delete the entire `sendGreeting` function.** It currently sits between the `useEffect` hooks and `send`.

```diff
- const sendGreeting = async () => {
-   setGreeted(true)
-
-   if (mode === 'question') {
-     console.log('[Chat] question mode — using hardcoded greeting')
-     addMessage({
-       role: 'assistant',
-       content:
-         "Hi, I'm Sage — your AI assistant. I know Jeff's work and his approach. What's your question?",
-     })
-     return
-   }
-
-   setStreaming(true)
-   addMessage({ role: 'assistant', content: '' })
-
-   try {
-     await streamSageResponse([], (chunk: string) => {
-       updateLastMessage(chunk)
-     })
-   } catch (error) {
-     updateLastMessage("Hello! I'm Sage, Jeff's AI assistant. How can I help you today?")
-   }
-   setStreaming(false)
- }
```

Also remove the `hasGreeted` and `setGreeted` destructures from the `useSageStore()` call at the top of `Chat`:

```diff
  const {
    messages,
    isExpanded,
    isStreaming,
-   hasGreeted,
    sessionId,
    mode,
    expand,
    collapse,
    addMessage,
    updateLastMessage,
    setStreaming,
-   setGreeted,
    setSessionId,
  } = useSageStore()
```

Store fields themselves stay — cheap to leave, and we'll re-evaluate usage in a follow-up.

### 3.4 — `visualViewport` listener — publish `--kb-h`

Add two lines inside the existing `onViewportChange`. Everything else in this effect stays.

```diff
    const onViewportChange = () => {
      if (!mobileQuery.matches) {
        setKeyboardOpen(false)
+       document.documentElement.style.setProperty('--kb-h', '0px')
        return
      }
      const open = vv.height < baselineHeight * 0.85
      setKeyboardOpen(open)
+     const inset = Math.max(0, baselineHeight - vv.height - vv.offsetTop)
+     document.documentElement.style.setProperty('--kb-h', `${inset}px`)
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
```

### 3.5 — Add `SageReply` component (above the `Chat` export)

Playfair prose, 2px green left rule, no bubble. Booking cards pass through to the existing `<BookingCard>` by reference — `{...card}` spreads whatever `parseBookingCards` returns, `openAs` + `embedCode` resolve from `sageParameters` exactly as the current assistant branch does.

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

Notes:
- `border-accent/35` uses the `accent` token alias (`var(--color-accent)` resolves to `45 106 79` (RGB components); `rgb(var(--color-accent))` ≡ `#2d6a4f`) with Tailwind's opacity modifier.
- `font-display` = Playfair via the config alias.
- `markdownComponents` is the existing inline-styled map at the top of `Chat.tsx`; leave it alone this patch.
- `[animation:sage-slide-up_0.28s_ease-out_both]` is an arbitrary-value animation shorthand targeting the keyframes added in section 1.

### 3.6 — Compact header — replace the 32px wordmark header

Exact "before" hunk from current code:

```diff
- <header style={{
-   background: 'white',
-   borderBottom: '1px solid rgba(26,25,23,0.08)',
-   padding: '20px clamp(24px, 5vw, 48px)',
-   display: 'flex',
-   alignItems: 'center',
-   justifyContent: 'space-between',
-   flexShrink: 0,
- }}>
-   <div>
-     <h1 style={{
-       fontFamily: 'var(--font-display)',
-       fontSize: '32px',
-       fontWeight: 400,
-       letterSpacing: '-0.01em',
-       color: 'var(--color-text-primary)',
-       marginBottom: '4px',
-     }}>
-       Sage
-     </h1>
-     <p style={{
-       fontFamily: 'var(--font-mono)',
-       fontSize: '11px',
-       letterSpacing: '0.15em',
-       textTransform: 'uppercase',
-       color: 'var(--color-text-dim)',
-     }}>
-       Jeff's AI Assistant
-     </p>
-   </div>
-   <button
-     onClick={collapse}
-     style={{
-       background: 'transparent',
-       border: 'none',
-       cursor: 'pointer',
-       padding: '8px',
-       fontSize: '24px',
-       color: 'var(--color-text-muted)',
-       lineHeight: 1,
-     }}
-     aria-label="Close chat"
-   >
-     ✕
-   </button>
- </header>

+ <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-black/[0.06] bg-bg/90 px-4 backdrop-blur-md backdrop-saturate-150 sm:px-8 [-webkit-backdrop-filter:saturate(180%)_blur(12px)]">
+   <div className="flex items-center gap-2.5">
+     <span
+       aria-hidden
+       className={`h-1.5 w-1.5 rounded-full transition-colors ${isStreaming ? 'bg-accent' : 'bg-accent/35'}`}
+     />
+     <h1 className="font-display text-[22px] font-normal leading-none tracking-[-0.01em] text-[color:var(--color-text-primary)]">
+       Sage
+     </h1>
+   </div>
+   <button
+     onClick={collapse}
+     aria-label="Close chat"
+     className="flex h-11 w-11 items-center justify-center bg-transparent text-[color:var(--color-text-muted)]"
+   >
+     <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
+       <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
+     </svg>
+   </button>
+ </header>
```

### 3.7 — Visitor message branch (italic quote, curly quotes via CSS)

Exact "before" hunk:

```diff
- if (msg.role === 'user') {
-   return (
-     <div
-       key={msg.id}
-       style={{
-         display: 'flex',
-         justifyContent: 'flex-end',
-       }}
-     >
-       <div style={{
-         maxWidth: '70%',
-         padding: '16px',
-         background: '#2d6a4f',
-         color: 'white',
-         borderRadius: '8px',
-         fontSize: '16px',
-         lineHeight: 1.7,
-         fontFamily: 'var(--font-body)',
-         whiteSpace: 'pre-wrap',
-       }}>
-         {msg.content}
-       </div>
-     </div>
-   )
- }

+ if (msg.role === 'user') {
+   return (
+     <div key={msg.id} className="flex justify-end">
+       <p className="sage-visitor-msg sage-animate max-w-[560px] whitespace-pre-wrap text-right font-display text-[18px] italic leading-[1.5] text-[color:var(--color-text-muted)] [animation:sage-slide-up_0.24s_ease-out_both] [text-wrap:pretty]">
+         {msg.content}
+       </p>
+     </div>
+   )
+ }
```

> **Contrast note:** `--color-text-muted` at the existing 62% opacity on `--color-bg` (`#f9f8f5`) is borderline for WCAG AA on 18px italic body text. The ACCEPTANCE criteria call for bumping `--color-text-muted` to **~70% opacity** (or picking a token that gives ≥4.5:1) **in `app/globals.css`** where the token is defined. This is a one-line token change; it also benefits every other use of `text-[color:var(--color-text-muted)]`. Verify with a contrast checker before merging.

### 3.8 — Assistant branch + empty-state greeting

Exact "before" hunk (covers both the `messages.length === 0` block and the assistant branch of `messages.map`):

```diff
-     {messages.length === 0 && (
-       <div style={{
-         flex: 1,
-         display: 'flex',
-         alignItems: 'center',
-         justifyContent: 'center',
-       }}>
-         <span style={{
-           fontFamily: 'Playfair Display, serif',
-           fontSize: 'clamp(48px, 6vw, 80px)',
-           fontWeight: 400,
-           color: '#1a1917',
-         }}>
-           Hello.
-         </span>
-       </div>
-     )}
-     {messages.map((msg) => {
-       if (msg.role === 'assistant' && !msg.content) return null
-       if (msg.role === 'user') {
-         /* (replaced in 3.7) */
-       }
-       const { prose, cards } = parseBookingCards(msg.content)
-       if (!prose && cards.length === 0) return null
-       return (
-         <div
-           key={msg.id}
-           style={{
-             display: 'flex',
-             flexDirection: 'column',
-             alignItems: 'flex-start',
-             gap: '12px',
-             maxWidth: '70%',
-           }}
-         >
-           {prose && (
-             <div style={{
-               width: '100%',
-               padding: '16px',
-               background: 'white',
-               color: 'var(--color-text-primary)',
-               border: '1px solid rgba(26,25,23,0.08)',
-               borderRadius: '8px',
-               fontSize: '16px',
-               lineHeight: 1.7,
-               fontFamily: 'var(--font-body)',
-             }}>
-               <ReactMarkdown components={markdownComponents}>{prose}</ReactMarkdown>
-             </div>
-           )}
-           {cards.length > 0 && (
-             <div className="flex w-full flex-col gap-2">
-               {cards.map((card, i) => {
-                 const match = sageParameters.find(p => (p.url ?? '') === card.url)
-                 const openAs: OpenAs = match?.open_as ?? 'new_tab'
-                 const embedCode = match?.embed_code ?? null
-                 return (
-                   <BookingCard
-                     key={i}
-                     {...card}
-                     openAs={openAs}
-                     embedCode={embedCode}
-                   />
-                 )
-               })}
-             </div>
-           )}
-         </div>
-       )
-     })}

+     {messages.length === 0 && (
+       <div className="sage-animate max-w-[680px] border-l-2 border-accent/35 pl-4 [animation:sage-slide-up_0.28s_ease-out_both]">
+         <p className="mb-3 font-display font-normal leading-[1.15] tracking-[-0.01em] text-[color:var(--color-text-primary)] text-[clamp(26px,4vw,36px)]">
+           {mode === 'question' ? (
+             <>Ask me anything about <em className="italic">Jeff's work</em>.</>
+           ) : (
+             <>Hi, I'm Sage. <em className="italic">What brings you here?</em></>
+           )}
+         </p>
+       </div>
+     )}
+     {messages.map((msg) => {
+       if (msg.role === 'assistant' && !msg.content) return null
+       if (msg.role === 'user') {
+         /* (3.7) */
+       }
+       const { prose, cards } = parseBookingCards(msg.content)
+       if (!prose && cards.length === 0) return null
+       return (
+         <SageReply
+           key={msg.id}
+           prose={prose}
+           cards={cards}
+           sageParameters={sageParameters}
+         />
+       )
+     })}
```

> **isError retry block:** the `{isError && !isStreaming && ( ... )}` block directly after `messages.map` **stays**. `SageReply` does **not** render error-state content; the existing error card + Retry button is how error recovery is shown. See section 3.9 for its Tailwind migration.

### 3.9 — Error retry block (migrate to Tailwind, preserve behavior)

Exact "before" hunk:

```diff
- {isError && !isStreaming && (
-   <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
-     <div style={{
-       maxWidth: '70%',
-       padding: '16px',
-       background: 'white',
-       color: 'var(--color-text-primary)',
-       border: '1px solid rgba(26,25,23,0.08)',
-       borderRadius: '8px',
-       fontSize: '16px',
-       lineHeight: 1.7,
-       fontFamily: 'var(--font-body)',
-     }}>
-       Something went wrong. Please try again.
-       <button
-         onClick={retryLastSend}
-         style={{
-           display: 'block',
-           marginTop: '12px',
-           background: 'transparent',
-           border: '1px solid rgba(26,25,23,0.15)',
-           borderRadius: '6px',
-           padding: '8px 16px',
-           fontFamily: 'var(--font-mono)',
-           fontSize: '11px',
-           letterSpacing: '0.12em',
-           textTransform: 'uppercase',
-           cursor: 'pointer',
-           color: 'var(--color-text-muted)',
-         }}
-       >
-         Retry
-       </button>
-     </div>
-   </div>
- )}

+ {isError && !isStreaming && (
+   <div className="flex justify-start">
+     <div className="max-w-[70%] rounded-lg border border-black/[0.08] bg-surface p-4 font-body text-base leading-[1.7] text-[color:var(--color-text-primary)]">
+       Something went wrong. Please try again.
+       <button
+         onClick={retryLastSend}
+         className="mt-3 block rounded-md border border-black/[0.15] bg-transparent px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--color-text-muted)]"
+       >
+         Retry
+       </button>
+     </div>
+   </div>
+ )}
```

### 3.10 — Streaming dots — hook up `sage-pulse`

Exact "before" hunk:

```diff
- {isStreaming && messages[messages.length - 1]?.content === '' && (
-   <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
-     <div style={{
-       padding: '16px',
-       background: 'white',
-       border: '1px solid rgba(26,25,23,0.08)',
-       borderRadius: '8px',
-       display: 'flex',
-       gap: '6px',
-     }}>
-       {[0, 1, 2].map((i) => (
-         <div
-           key={i}
-           style={{
-             width: '6px',
-             height: '6px',
-             borderRadius: '50%',
-             background: '#2d6a4f',
-             animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
-           }}
-         />
-       ))}
-     </div>
-   </div>
- )}

+ {isStreaming && messages[messages.length - 1]?.content === '' && (
+   <div data-sage-streaming className="flex justify-start">
+     <div className="flex gap-1.5 rounded-lg border border-black/[0.08] bg-surface p-4">
+       {[0, 1, 2].map((i) => (
+         <div
+           key={i}
+           className="h-1.5 w-1.5 rounded-full bg-accent"
+           style={{ animation: `sage-pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
+         />
+       ))}
+     </div>
+   </div>
+ )}
```

> `sage-pulse` replaces the old `pulse` keyframe. The `data-sage-streaming` attribute lets the reduced-motion guard in section 1 target this block without a Tailwind class rename.

### 3.11 — Composer tray (migrate to Tailwind, pad for `--kb-h`)

Exact "before" hunk covers the whole bottom tray including the tagline line. One block; paste replacement whole.

```diff
- <div style={{
-   background: 'white',
-   borderTop: '1px solid rgba(26,25,23,0.08)',
-   padding: '12px clamp(16px, 4vw, 48px)',
-   paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
-   flexShrink: 0,
- }}>
-   <div style={{
-     maxWidth: '900px',
-     margin: '0 auto',
-     display: 'flex',
-     gap: '12px',
-     alignItems: 'center',
-   }}>
-     <textarea
-       ref={textareaRef}
-       value={input}
-       onChange={(e) => setInput(e.target.value)}
-       onKeyDown={handleKey}
-       placeholder=""
-       rows={1}
-       style={{
-         flex: 1,
-         background: '#f9f8f5',
-         border: '1px solid rgba(26,25,23,0.12)',
-         borderRadius: '12px',
-         padding: '14px 18px',
-         fontFamily: 'var(--font-body)',
-         fontSize: '16px',
-         color: 'var(--color-text-primary)',
-         resize: 'none',
-         outline: 'none',
-         lineHeight: 1.5,
-         minHeight: '48px',
-         maxHeight: '120px',
-       }}
-     />
-     <button
-       onClick={send}
-       disabled={isStreaming || !input.trim()}
-       style={{
-         background: '#2d6a4f',
-         border: 'none',
-         borderRadius: '50%',
-         width: '44px',
-         height: '44px',
-         cursor: isStreaming || !input.trim() ? 'not-allowed' : 'pointer',
-         opacity: isStreaming || !input.trim() ? 0.4 : 1,
-         display: 'flex',
-         alignItems: 'center',
-         justifyContent: 'center',
-         flexShrink: 0,
-         color: 'white',
-         fontSize: '20px',
-       }}
-       aria-label="Send message"
-     >
-       →
-     </button>
-   </div>
-   <p style={{
-     textAlign: 'center',
-     fontFamily: 'DM Sans, sans-serif',
-     fontSize: '11px',
-     color: 'rgba(26,25,23,0.4)',
-     marginTop: '8px',
-     opacity: keyboardOpen ? 0 : 1,
-     transition: 'opacity 0.3s ease',
-   }}>
-     Sage knows Jeff's background and will give you a straight answer.
-   </p>
- </div>

+ <div className="flex-shrink-0 border-t border-black/[0.08] bg-surface px-4 pt-3 sm:px-12 pb-[max(12px,calc(env(safe-area-inset-bottom)+var(--kb-h)))]">
+   <div className="mx-auto flex max-w-[900px] items-center gap-3">
+     <textarea
+       ref={textareaRef}
+       value={input}
+       onChange={(e) => setInput(e.target.value)}
+       onKeyDown={handleKey}
+       placeholder=""
+       rows={1}
+       className="min-h-[48px] max-h-[120px] flex-1 resize-none rounded-xl border border-black/[0.12] bg-bg px-[18px] py-3.5 font-body text-base leading-[1.5] text-[color:var(--color-text-primary)] outline-none"
+     />
+     <button
+       onClick={send}
+       disabled={isStreaming || !input.trim()}
+       aria-label="Send message"
+       className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border-0 bg-accent text-xl text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
+     >
+       →
+     </button>
+   </div>
+   <p
+     className="mt-2 text-center font-body text-[11px] text-[color:var(--color-text-muted)] transition-opacity duration-300"
+     style={{ opacity: keyboardOpen ? 0 : 1 }}
+   >
+     Sage knows Jeff's background and will give you a straight answer.
+   </p>
+ </div>
```

> The one remaining `style={{ opacity: ... }}` is intentional — `keyboardOpen` is JS state. Converting to Tailwind would require a conditional class string, which is noisier for one property.

### 3.12 — Remove the orphaned inline `<style>` block

The current block at the bottom of `Chat.tsx` defines **both** `expandChat` (used by the overlay wrapper's inline `animation: 'expandChat 0.3s ease-out'`) and `pulse` (used by the streaming dots, which section 3.10 now points at `sage-pulse`).

Move `expandChat` to `app/globals.css` alongside the other keyframes so the overlay entry still animates, then delete the entire `<style>` block from `Chat.tsx`.

**In `app/globals.css`, add** (inside the appended block from section 1):

```css
@keyframes expandChat {
  from { opacity: 0; transform: scale(0.98); }
  to   { opacity: 1; transform: scale(1); }
}
```

**In `Chat.tsx`, delete:**

```diff
- <style>{`
-   @keyframes expandChat {
-     from { opacity: 0; transform: scale(0.98); }
-     to   { opacity: 1; transform: scale(1); }
-   }
-   @keyframes pulse {
-     0%, 100% { opacity: 0.2; transform: scale(0.8); }
-     50%       { opacity: 1;   transform: scale(1.2); }
-   }
- `}</style>
```

The overlay wrapper's inline `animation: 'expandChat 0.3s ease-out'` keeps working because the keyframes are now globally defined. No JSX rename needed.

### 3.13 — Remove the inline transcript preview from the `#chat` anchor section

Exact "before" hunk:

```diff
-         {messages.length > 0 && (
-           <div style={{
-             maxHeight: '240px',
-             overflowY: 'auto',
-             marginBottom: '24px',
-             display: 'flex',
-             flexDirection: 'column',
-             gap: '16px',
-             padding: '16px',
-             background: 'white',
-             border: '1px solid rgba(26,25,23,0.08)',
-             borderRadius: '4px',
-           }}>
-             {messages.slice(-3).map((msg) => (
-               <div
-                 key={msg.id}
-                 style={{
-                   fontSize: '14px',
-                   lineHeight: 1.6,
-                   color: msg.role === 'user' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
-                   fontWeight: msg.role === 'user' ? 500 : 400,
-                 }}
-               >
-                 <strong style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '4px' }}>
-                   {msg.role === 'user' ? 'You' : 'Sage'}
-                 </strong>
-                 {msg.content.substring(0, 120)}{msg.content.length > 120 ? '...' : ''}
-               </div>
-             ))}
-           </div>
-         )}
```

No replacement. The `<button onClick={() => expand()}>…</button>` below still toggles its label on `messages.length`, which remains honest.

The section's eyebrow, headline, lede, green CTA, and the outlined "Book a Session" link stay as-is. A follow-up can migrate the rest of the section to Tailwind; outside scope for this patch.

---

## 4 — `CLAUDE.md` (edit)

Two updates. Do not restructure the file — only edit the specific sections.

### 4.1 — Public-site Chat row

Update the row in the public-site components table (or equivalent) to reflect:
- Compact 56px header with status pip (`isStreaming`) — replaces the 32px wordmark + mono subtitle.
- Typographic Sage replies via `SageReply` (2px green left rule, no bubble).
- Italic-quote visitor replies with CSS curly quotes (`.sage-visitor-msg`).
- Empty state IS the greeting — `messages.length === 0` renders the mode-aware Playfair greeting. `sendGreeting` has been removed.
- Tailwind-only markup inside the overlay (markdown components + booking card internals excepted — existing).

### 4.2 — `#chat` anchor section

Note that the inline 240px transcript preview has been removed. The section now renders: eyebrow → headline → lede → green Start/Continue CTA → outlined Book a Session link. Nothing else. The `#chat` hash anchor and reveal animation are unchanged.

---

## Dev TODOs (deferred — do not land in this PR)

- **TODO-00 — Starter chips.** Empty-state chip row that fills the textarea on tap (no auto-send). Needs Jeff-vetted copy; probably sourced from `sage_parameters` or a new admin surface.
- **TODO-01 — Attach (+) button.** Accepted MIME types, `messages[].attachments` schema, `/api/sage/upload` route (tenant-scoped, RLS), vision-API wiring through `src/lib/sage.ts`, CLAUDE.md update.
- **TODO-02 — Voice input / mic morph.** Spike Web Speech API vs. server-side Whisper. Define interaction model (tap-and-hold vs. modal sheet), partial-transcript streaming semantics, accessibility path.

Each is its own follow-up ticket with its own acceptance criteria.
