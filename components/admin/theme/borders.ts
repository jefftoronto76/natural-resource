const borderWidthPrimitives = {
  1: '1px',
  2: '2px',
  3: '3px',
  4: '4px'
} as const;

/** @internal Aggregation-only export. Use tokens.ts as public entrypoint. */
export const internalBorderTokens = {
  width: {
    subtle: borderWidthPrimitives[1],
    default: borderWidthPrimitives[2],
    accent: borderWidthPrimitives[3],
    strong: borderWidthPrimitives[4]
  }
} as const;
