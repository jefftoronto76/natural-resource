export type OpenAs = 'new_tab' | 'popup'

export interface BookingCardData {
  label: string
  description: string
  ctaLabel: string
  url: string
}

export interface SageParameterPublic {
  key: string
  label: string | null
  description: string | null
  cta_label: string | null
  url: string | null
  open_as: OpenAs
  embed_code: string | null
}

const BOOKING_REGEX = /\[BOOKING:\s*([^|\]]*)\|\s*([^|\]]*)\|\s*([^|\]]*)\|\s*([^\]]*)\]/g

export function parseBookingCards(content: string): { prose: string; cards: BookingCardData[] } {
  const cards: BookingCardData[] = []
  let prose = content.replace(
    BOOKING_REGEX,
    (_match, label: string, description: string, ctaLabel: string, url: string) => {
      cards.push({
        label: label.trim(),
        description: description.trim(),
        ctaLabel: ctaLabel.trim(),
        url: url.trim(),
      })
      return ''
    },
  )
  prose = prose.replace(/\[BOOKING:[^\]]*$/, '')
  prose = prose.replace(/\n{3,}/g, '\n\n').trim()
  return { prose, cards }
}
