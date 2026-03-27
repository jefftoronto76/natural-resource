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
  isExpanded: boolean
  addMessage: (msg: Omit<SageMessage, 'id' | 'timestamp'>) => void
  updateLastMessage: (content: string) => void
  setVisitorName: (name: string) => void
  setGreeted: (greeted: boolean) => void
  setStreaming: (streaming: boolean) => void
  expand: () => void
  collapse: () => void
  reset: () => void
}

export const useSageStore = create<SageStore>((set) => ({
  messages: [],
  visitorName: null,
  hasGreeted: false,
  isStreaming: false,
  isExpanded: false,
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
  expand: () => set({ isExpanded: true }),
  collapse: () => set({ isExpanded: false }),
  reset: () => set({ messages: [], visitorName: null, hasGreeted: false, isStreaming: false, isExpanded: false }),
}))
