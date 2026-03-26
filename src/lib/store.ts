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
