import type { RefObject } from 'react'
import { create } from 'zustand'

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatStore {
  messages: Message[]
  loading: boolean
  addMessage: (msg: Message) => void
  setLoading: (loading: boolean) => void
  reset: () => void
}

const INITIAL_MESSAGES: Message[] = [
  { role: 'assistant', content: 'What are you working on?' }
]

export const useChatStore = create<ChatStore>((set) => ({
  messages: INITIAL_MESSAGES,
  loading: false,
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setLoading: (loading) => set({ loading }),
  reset: () => set({ messages: INITIAL_MESSAGES, loading: false }),
}))

export interface SageMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface SageStore {
  messages: SageMessage[]
  visitorName: string | null
  hasGreeted: boolean
  isStreaming: boolean
  // Retained on the store but never flipped to true after the chat-first
  // hero migration. The dormant overlay block in Chat.tsx still gates on it.
  isExpanded: boolean
  mode: 'question' | null
  sessionId: string | null
  composerRef: RefObject<HTMLTextAreaElement | null> | null
  addMessage: (msg: Omit<SageMessage, 'id' | 'timestamp'>) => void
  updateLastMessage: (content: string) => void
  setVisitorName: (name: string) => void
  setGreeted: (greeted: boolean) => void
  setStreaming: (streaming: boolean) => void
  setSessionId: (id: string) => void
  setMode: (mode: 'question' | null) => void
  setComposerRef: (ref: RefObject<HTMLTextAreaElement | null> | null) => void
  focusComposer: () => void
  expand: (mode?: 'question') => void
  collapse: () => void
  reset: () => void
}

function scrollAndFocusHero(): void {
  if (typeof window === 'undefined') return
  const hero = document.getElementById('hero')
  hero?.scrollIntoView({ behavior: 'smooth' })
  // Focus after the scroll has had a chance to commit. A single rAF is
  // enough on modern browsers; iOS occasionally needs a small timeout for
  // the keyboard to come up cleanly.
  requestAnimationFrame(() => {
    setTimeout(() => useSageStore.getState().focusComposer(), 60)
  })
}

export const useSageStore = create<SageStore>((set, get) => ({
  messages: [],
  visitorName: null,
  hasGreeted: false,
  isStreaming: false,
  isExpanded: false,
  mode: null,
  sessionId: null,
  composerRef: null,
  addMessage: (msg) => set((state) => ({
    messages: [...state.messages, {
      ...msg,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now()
    }]
  })),
  updateLastMessage: (content) => set((state) => {
    const messages = [...state.messages]
    if (messages.length > 0) {
      messages[messages.length - 1] = { ...messages[messages.length - 1], content }
    }
    return { messages }
  }),
  setVisitorName: (name) => set({ visitorName: name }),
  setGreeted: (greeted) => set({ hasGreeted: greeted }),
  setStreaming: (streaming) => set({ isStreaming: streaming }),
  setSessionId: (id) => set({ sessionId: id }),
  setMode: (mode) => set({ mode }),
  setComposerRef: (ref) => set({ composerRef: ref }),
  focusComposer: () => {
    const ref = get().composerRef
    ref?.current?.focus({ preventScroll: false })
  },
  // Repurposed: instead of opening the overlay, scroll to the in-page hero
  // composer and focus it. Optionally sets question mode. Callers (Nav, Work,
  // the #chat final-CTA, ?mode=question URL detection) keep working unchanged.
  expand: (mode) => {
    if (mode) set({ mode })
    scrollAndFocusHero()
  },
  // No-op after the chat-first migration. Retained so any caller (Escape
  // handler, close button on the dormant overlay) doesn't crash.
  collapse: () => {},
  reset: () => set({
    messages: [],
    visitorName: null,
    hasGreeted: false,
    isStreaming: false,
    isExpanded: false,
    mode: null,
    sessionId: null,
    composerRef: null,
  }),
}))
