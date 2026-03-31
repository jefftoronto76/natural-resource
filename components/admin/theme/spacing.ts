const spacingPrimitives = {
  0: '0rem',
  1: '0.125rem',
  2: '0.25rem',
  3: '0.5rem',
  4: '0.75rem',
  5: '1rem',
  6: '1.5rem',
  7: '2rem',
  8: '3rem'
} as const;

/** @internal Aggregation-only export. Use tokens.ts as public entrypoint. */
export const internalSpacingTokens = {
  inset: {
    none: spacingPrimitives[0],
    xs: spacingPrimitives[2],
    sm: spacingPrimitives[3],
    md: spacingPrimitives[5],
    lg: spacingPrimitives[6],
    xl: spacingPrimitives[7]
  },
  stack: {
    none: spacingPrimitives[0],
    xs: spacingPrimitives[2],
    sm: spacingPrimitives[3],
    md: spacingPrimitives[5],
    lg: spacingPrimitives[6],
    xl: spacingPrimitives[7]
  },
  inline: {
    none: spacingPrimitives[0],
    xs: spacingPrimitives[1],
    sm: spacingPrimitives[2],
    md: spacingPrimitives[4],
    lg: spacingPrimitives[5],
    xl: spacingPrimitives[6]
  },
  gap: {
    none: spacingPrimitives[0],
    xs: spacingPrimitives[2],
    sm: spacingPrimitives[3],
    md: spacingPrimitives[4],
    lg: spacingPrimitives[5],
    xl: spacingPrimitives[6]
  }
} as const;
