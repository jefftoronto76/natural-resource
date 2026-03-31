import { forwardRef, type HTMLAttributes } from 'react';

import { tokens, type ThemeStyle } from '../theme/tokens';

type CardVariant = 'default' | 'outlined' | 'interactive';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const variantStyles: Record<CardVariant, ThemeStyle> = {
  default: {
    '--card-surface': tokens.themes.light.color.surface.panel,
    '--card-border': 'transparent'
  },
  outlined: {
    '--card-surface': tokens.themes.light.color.surface.canvas,
    '--card-border': tokens.themes.light.color.border.subtle
  },
  interactive: {
    '--card-surface': tokens.themes.light.color.surface.canvas,
    '--card-border': tokens.themes.light.color.border.subtle,
    '--card-hover-surface': tokens.themes.light.state.hover.surface,
    '--card-hover-border': tokens.themes.light.state.hover.border
  }
};

const baseStyle: ThemeStyle = {
  '--card-radius': tokens.radius.lg,
  '--card-padding': tokens.spacing.inset.lg,
  '--card-transition-duration': tokens.themes.light.state.hover.duration,
  '--card-transition-easing': tokens.themes.light.state.hover.easing
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = 'default', className, style, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={[
        'rounded-[var(--card-radius)] border border-[var(--card-border)] bg-[var(--card-surface)] p-[var(--card-padding)]',
        'transition-colors duration-[var(--card-transition-duration)] ease-[var(--card-transition-easing)]',
        variant === 'interactive' ? 'hover:border-[var(--card-hover-border)] hover:bg-[var(--card-hover-surface)]' : '',
        className
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ ...baseStyle, ...variantStyles[variant], ...style }}
      {...props}
    />
  );
});
