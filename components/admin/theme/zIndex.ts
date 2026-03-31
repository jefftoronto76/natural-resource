const zIndexPrimitives = {
  base: 0,
  raised: 10,
  overlay: 20,
  modal: 30,
  toast: 40,
  tooltip: 50
} as const;

/** @internal Aggregation-only export. Use tokens.ts as public entrypoint. */
export const internalZIndexTokens = {
  base: zIndexPrimitives.base,
  raised: zIndexPrimitives.raised,
  overlay: zIndexPrimitives.overlay,
  modal: zIndexPrimitives.modal,
  toast: zIndexPrimitives.toast,
  tooltip: zIndexPrimitives.tooltip
} as const;
