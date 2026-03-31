const typographyPrimitives = {
  family: {
    sans: 'Inter, ui-sans-serif, system-ui, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, monospace'
  },
  size: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem'
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7
  },
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },
  letterSpacing: {
    tight: '-0.01em',
    normal: '0em',
    wide: '0.01em'
  }
} as const;

/** @internal Aggregation-only export. Use tokens.ts as public entrypoint. */
export const internalTypographyTokens = {
  family: typographyPrimitives.family,
  size: typographyPrimitives.size,
  lineHeight: typographyPrimitives.lineHeight,
  weight: typographyPrimitives.weight,
  letterSpacing: typographyPrimitives.letterSpacing,
  role: {
    body: {
      sm: {
        fontFamily: typographyPrimitives.family.sans,
        fontSize: typographyPrimitives.size.sm,
        lineHeight: typographyPrimitives.lineHeight.normal,
        fontWeight: typographyPrimitives.weight.regular,
        letterSpacing: typographyPrimitives.letterSpacing.normal
      },
      md: {
        fontFamily: typographyPrimitives.family.sans,
        fontSize: typographyPrimitives.size.md,
        lineHeight: typographyPrimitives.lineHeight.normal,
        fontWeight: typographyPrimitives.weight.regular,
        letterSpacing: typographyPrimitives.letterSpacing.normal
      }
    },
    label: {
      sm: {
        fontFamily: typographyPrimitives.family.sans,
        fontSize: typographyPrimitives.size.xs,
        lineHeight: typographyPrimitives.lineHeight.tight,
        fontWeight: typographyPrimitives.weight.medium,
        letterSpacing: typographyPrimitives.letterSpacing.wide
      },
      md: {
        fontFamily: typographyPrimitives.family.sans,
        fontSize: typographyPrimitives.size.sm,
        lineHeight: typographyPrimitives.lineHeight.tight,
        fontWeight: typographyPrimitives.weight.medium,
        letterSpacing: typographyPrimitives.letterSpacing.wide
      }
    },
    title: {
      md: {
        fontFamily: typographyPrimitives.family.sans,
        fontSize: typographyPrimitives.size.lg,
        lineHeight: typographyPrimitives.lineHeight.tight,
        fontWeight: typographyPrimitives.weight.semibold,
        letterSpacing: typographyPrimitives.letterSpacing.tight
      },
      lg: {
        fontFamily: typographyPrimitives.family.sans,
        fontSize: typographyPrimitives.size.xl,
        lineHeight: typographyPrimitives.lineHeight.tight,
        fontWeight: typographyPrimitives.weight.semibold,
        letterSpacing: typographyPrimitives.letterSpacing.tight
      }
    }
  }
} as const;
