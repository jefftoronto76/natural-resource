/// <reference types="next" />

// Calendly widget — loaded via next/script in app/layout.tsx
interface Window {
  Calendly?: {
    initPopupWidget: (options: { url: string }) => void
    initInlineWidget: (options: { url: string; parentElement: HTMLElement }) => void
  }
}
