import { forwardRef, type HTMLAttributes } from 'react';

import { tokens, type ThemeStyle } from '../theme/tokens';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger';
type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const variantStyles: Record<BadgeVariant, ThemeStyle> = {
  default: {
    '--badge-bg': tokens.themes.light.color.surface.elevated,
    '--badge-text': tokens.themes.light.color.text.primary,
    '--badge-border': tokens.themes.light.color.border.subtle
  },
  success: {
    '--badge-bg': tokens.themes.light.color.feedback.successSurface,
    '--badge-text': tokens.themes.light.color.feedback.success,
    '--badge-border': tokens.themes.light.color.feedback.success
  },
  warning: {
    '--badge-bg': tokens.themes.light.color.feedback.warningSurface,
    '--badge-text': tokens.themes.light.color.feedback.warning,
    '--badge-border': tokens.themes.light.color.feedback.warning
  },
  danger: {
    '--badge-bg': tokens.themes.light.color.feedback.dangerSurface,
    '--badge-text': tokens.themes.light.color.feedback.danger,
    '--badge-border': tokens.themes.light.color.feedback.danger
  }
};

const sizeStyles: Record<BadgeSize, ThemeStyle> = {
  sm: {
    '--badge-height': tokens.spacing.inset.md,
    '--badge-padding-inline': tokens.spacing.inline.sm,
    '--badge-font-size': tokens.typography.role.label.sm.fontSize
  },
  md: {
    '--badge-height': tokens.spacing.inset.lg,
    '--badge-padding-inline': tokens.spacing.inline.md,
    '--badge-font-size': tokens.typography.role.label.md.fontSize
  }
};

const baseStyle: ThemeStyle = {
  '--badge-radius': tokens.radius.pill,
  fontFamily: tokens.typography.role.label.md.fontFamily,
  fontWeight: tokens.typography.role.label.md.fontWeight,
  letterSpacing: tokens.typography.role.label.md.letterSpacing
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { variant = 'default', size = 'md', className, style, ...props },
  ref
) {
  return (
    <span
      ref={ref}
      className={[
        'inline-flex items-center justify-center whitespace-nowrap',
        'h-[var(--badge-height)] rounded-[var(--badge-radius)] border border-[var(--badge-border)]',
        'bg-[var(--badge-bg)] px-[var(--badge-padding-inline)] text-[var(--badge-text)] text-[length:var(--badge-font-size)]',
        className
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ ...baseStyle, ...sizeStyles[size], ...variantStyles[variant], ...style }}
      {...props}
    />
  );
});
