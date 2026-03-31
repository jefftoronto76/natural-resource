const colorPrimitives = {
  neutral: {
    0: '#FFFFFF',
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    500: '#6B7280',
    700: '#374151',
    900: '#111827'
  },
  brand: {
    500: '#2563EB',
    600: '#1D4ED8'
  },
  success: {
    500: '#16A34A',
    50: '#F0FDF4'
  },
  warning: {
    500: '#D97706',
    50: '#FFFBEB'
  },
  danger: {
    500: '#DC2626',
    50: '#FEF2F2'
  },
  info: {
    500: '#0284C7',
    50: '#F0F9FF'
  }
} as const;

const lightColorTokens = {
  surface: {
    canvas: colorPrimitives.neutral[0],
    panel: colorPrimitives.neutral[50],
    elevated: colorPrimitives.neutral[100]
  },
  text: {
    primary: colorPrimitives.neutral[900],
    muted: colorPrimitives.neutral[500],
    inverse: colorPrimitives.neutral[0]
  },
  border: {
    subtle: colorPrimitives.neutral[200],
    strong: colorPrimitives.neutral[300]
  },
  icon: {
    primary: colorPrimitives.neutral[700],
    muted: colorPrimitives.neutral[500]
  },
  interactive: {
    primary: colorPrimitives.brand[500],
    primaryHover: colorPrimitives.brand[600]
  },
  feedback: {
    success: colorPrimitives.success[500],
    successSurface: colorPrimitives.success[50],
    warning: colorPrimitives.warning[500],
    warningSurface: colorPrimitives.warning[50],
    danger: colorPrimitives.danger[500],
    dangerSurface: colorPrimitives.danger[50],
    info: colorPrimitives.info[500],
    infoSurface: colorPrimitives.info[50]
  }
} as const;

const darkColorTokens = {
  surface: {
    canvas: colorPrimitives.neutral[900],
    panel: colorPrimitives.neutral[700],
    elevated: colorPrimitives.neutral[500]
  },
  text: {
    primary: colorPrimitives.neutral[50],
    muted: colorPrimitives.neutral[300],
    inverse: colorPrimitives.neutral[900]
  },
  border: {
    subtle: colorPrimitives.neutral[500],
    strong: colorPrimitives.neutral[300]
  },
  icon: {
    primary: colorPrimitives.neutral[100],
    muted: colorPrimitives.neutral[300]
  },
  interactive: {
    primary: colorPrimitives.brand[500],
    primaryHover: colorPrimitives.brand[600]
  },
  feedback: {
    success: colorPrimitives.success[500],
    successSurface: colorPrimitives.neutral[700],
    warning: colorPrimitives.warning[500],
    warningSurface: colorPrimitives.neutral[700],
    danger: colorPrimitives.danger[500],
    dangerSurface: colorPrimitives.neutral[700],
    info: colorPrimitives.info[500],
    infoSurface: colorPrimitives.neutral[700]
  }
} as const;

/** @internal Aggregation-only export. Use tokens.ts as public entrypoint. */
export const internalColorTokens = {
  light: lightColorTokens,
  dark: darkColorTokens
} as const;
