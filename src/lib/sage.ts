import { SageMessage } from './store'

const SYSTEM_PROMPT = `You are Sage, Jeff Lougheed's AI assistant on jefflougheed.ca. Jeff is a revenue and operations leader with 20+ years experience helping technology companies fix the problems slowing growth. He offers two services: 1-on-1 Coaching for ambitious professionals, and Embedded Execution Support for founders, CEOs, and PE leaders. Entry point is a $250 / 60-minute working session (ICF-aligned, root-cause focused). A free 15-minute discovery call is also available. Your job is to engage visitors warmly, understand what they're looking for, and guide them naturally toward booking. You lead with questions. You are direct, warm, and confident. You never make specific promises about outcomes. You never discuss competitors. If a conversation becomes too complex or out of scope, always offer the free discovery call as the next step — never leave a visitor without a useful path forward. Working session booking: https://calendly.com/naturalresource/working-session. Discovery call: https://calendly.com/naturalresource/discovery-call.`

const GREETING_MESSAGE = `Hi there! I'm Sage, Jeff's AI assistant. I'm here to help you figure out if Jeff's coaching or execution support might be a fit for what you're working on.

Before we dive in — what's your name?`

const mockResponses = {
  greeting: GREETING_MESSAGE,
  nameCapture: (name: string) => `Great to meet you, ${name}! So what brings you here today? Are you working through a specific challenge, or just exploring what Jeff offers?`,
  exploration: `That's a common situation. Jeff works with a lot of folks navigating exactly that. Can you tell me more about what's slowing you down right now?`,
  conversion: (name: string) => `${name}, based on what you've shared, it sounds like a working session could be really valuable. Jeff uses a 60-minute ICF-aligned session to get to the root cause and map out next steps — $250, and you'll walk away with clarity.

Want to book that? Here's the link: https://calendly.com/naturalresource/working-session

Or if you want to talk through fit first, there's a free 15-minute discovery call: https://calendly.com/naturalresource/discovery-call`,
  stopChat: `I appreciate you sharing all that. This feels like it's getting into territory that's better handled live rather than over chat.

The best next step would be a free 15-minute discovery call with Jeff so you can talk through the specifics directly: https://calendly.com/naturalresource/discovery-call

Thanks for the conversation — hope to see you on Jeff's calendar soon!`
}

export function getGreeting(): string {
  return mockResponses.greeting
}

function detectName(message: string): string | null {
  const patterns = [
    /(?:i'm|im|i am|my name is|call me|this is)\s+([a-z]+)/i,
    /^([A-Z][a-z]+)$/,
    /^([A-Z][a-z]+)\s*$/
  ]

  for (const pattern of patterns) {
    const match = message.match(pattern)
    if (match) {
      const name = match[1].trim()
      if (name.length > 1 && name.length < 20) {
        return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
      }
    }
  }
  return null
}

function shouldConvert(messages: SageMessage[], currentMessage: string): boolean {
  const projectKeywords = ['project', 'building', 'startup', 'company', 'team', 'revenue', 'growth']
  const budgetKeywords = ['budget', 'cost', 'price', 'invest', 'spend']
  const timelineKeywords = ['timeline', 'deadline', 'urgent', 'soon', 'month', 'quarter']

  const hasProjectIntent = projectKeywords.some(kw =>
    messages.some(m => m.content.toLowerCase().includes(kw))
  )
  const hasBudgetMention = budgetKeywords.some(kw => currentMessage.toLowerCase().includes(kw))
  const hasTimelineMention = timelineKeywords.some(kw => currentMessage.toLowerCase().includes(kw))

  return messages.length >= 6 || (hasProjectIntent && (hasBudgetMention || hasTimelineMention))
}

function shouldStop(message: string): boolean {
  const stopSignals = [
    'off topic', 'different question', 'not relevant', 'something else',
    'politics', 'religion', 'illegal', 'unethical', 'harm'
  ]
  return stopSignals.some(signal => message.toLowerCase().includes(signal))
}

export async function streamSageResponse(
  messages: SageMessage[],
  onChunk: (chunk: string) => void
): Promise<void> {
  const visitorName = null
  const generator = sendSageMessage(messages, visitorName)

  for await (const chunk of generator) {
    onChunk(chunk)
  }
}

export async function* sendSageMessage(
  messages: SageMessage[],
  visitorName: string | null
): AsyncGenerator<string> {
  await new Promise(resolve => setTimeout(resolve, 800))

  const lastUserMessage = messages[messages.length - 1]

  if (!visitorName) {
    const detectedName = detectName(lastUserMessage.content)
    if (detectedName) {
      const response = mockResponses.nameCapture(detectedName)
      for (let i = 0; i <= response.length; i++) {
        yield response.slice(0, i)
        await new Promise(resolve => setTimeout(resolve, 20))
      }
      return
    }
  }

  if (shouldStop(lastUserMessage.content)) {
    const response = mockResponses.stopChat
    for (let i = 0; i <= response.length; i++) {
      yield response.slice(0, i)
      await new Promise(resolve => setTimeout(resolve, 20))
    }
    return
  }

  if (shouldConvert(messages, lastUserMessage.content) && visitorName) {
    const response = mockResponses.conversion(visitorName)
    for (let i = 0; i <= response.length; i++) {
      yield response.slice(0, i)
      await new Promise(resolve => setTimeout(resolve, 20))
    }
    return
  }

  const response = mockResponses.exploration
  for (let i = 0; i <= response.length; i++) {
    yield response.slice(0, i)
    await new Promise(resolve => setTimeout(resolve, 20))
  }
}
