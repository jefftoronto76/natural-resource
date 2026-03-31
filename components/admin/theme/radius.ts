const radiusPrimitives = {
  0: '0px',
  1: '2px',
  2: '4px',
  3: '8px',
  4: '12px',
  full: '9999px'
} as const;

/** @internal Aggregation-only export. Use tokens.ts as public entrypoint. */
export const internalRadiusTokens = {
  none: radiusPrimitives[0],
  sm: radiusPrimitives[1],
  md: radiusPrimitives[2],
  lg: radiusPrimitives[3],
  xl: radiusPrimitives[4],
  pill: radiusPrimitives.full,
  round: radiusPrimitives.full
} as const;
