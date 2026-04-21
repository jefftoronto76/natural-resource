import type { MantineColor } from '@mantine/core'

export const BLOCK_TYPES = [
  'identity',
  'knowledge',
  'guardrail',
  'process',
  'escalation',
] as const

export type BlockType = (typeof BLOCK_TYPES)[number]

export const TYPE_COLORS: Record<BlockType, MantineColor> = {
  identity: 'violet',
  knowledge: 'blue',
  guardrail: 'red',
  process: 'orange',
  escalation: 'yellow',
}

// Labels preserve the existing ordinal-suffix format from BlocksTable.tsx
// so admins still see compile order on the badge. Deviates from
// INTEGRATION §4's plain-name labels; continuity win over spec literalness.
export const TYPE_LABELS: Record<BlockType, string> = {
  guardrail: 'GUARDRAIL (1st)',
  identity: 'IDENTITY (2nd)',
  process: 'PROCESS (3rd)',
  knowledge: 'KNOWLEDGE (4th)',
  escalation: 'ESCALATION (5th)',
}
