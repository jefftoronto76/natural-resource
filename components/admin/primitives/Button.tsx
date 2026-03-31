import { forwardRef, type ButtonHTMLAttributes } from 'react';

import { tokens, type ThemeStyle } from '../theme/tokens';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, ThemeStyle> = {
  primary: {
    '--button-bg': tokens.themes.light.color.interactive.primary,
    '--button-bg-hover': tokens.themes.light.color.interactive.primaryHover,
    '--button-text': tokens.themes.light.color.text.inverse,
    '--button-border': tokens.themes.light.color.interactive.primary
  },
  secondary: {
    '--button-bg': tokens.themes.light.color.surface.panel,
    '--button-bg-hover': tokens.themes.light.state.hover.surface,
    '--button-text': tokens.themes.light.color.text.primary,
    '--button-border': tokens.themes.light.color.border.subtle
  },
  ghost: {
    '--button-bg': 'transparent',
    '--button-bg-hover': tokens.themes.light.state.hover.surface,
    '--button-text': tokens.themes.light.color.text.primary,
    '--button-border': 'transparent'
  },
  danger: {
    '--button-bg': tokens.themes.light.color.feedback.danger,
    '--button-bg-hover': tokens.themes.light.state.hover.surface,
    '--button-text': tokens.themes.light.color.text.inverse,
    '--button-border': tokens.themes.light.color.feedback.danger
  }
};

const sizeStyles: Record<ButtonSize, ThemeStyle> = {
  sm: {
    '--button-height': tokens.spacing.inset.lg,
    '--button-padding-inline': tokens.spacing.inline.md,
    '--button-font-size': tokens.typography.role.label.sm.fontSize
  },
  md: {
    '--button-height': tokens.spacing.inset.xl,
    '--button-padding-inline': tokens.spacing.inline.lg,
    '--button-font-size': tokens.typography.role.label.md.fontSize
  },
  lg: {
    '--button-height': tokens.spacing.stack.xl,
    '--button-padding-inline': tokens.spacing.inline.xl,
    '--button-font-size': tokens.typography.role.body.md.fontSize
  }
};

const baseStyle: ThemeStyle = {
  '--button-radius': tokens.radius.md,
  '--button-focus-ring': tokens.themes.light.state.focus.ring,
  '--button-disabled-bg': tokens.themes.light.state.disabled.surface,
  '--button-disabled-border': tokens.themes.light.state.disabled.border,
  '--button-disabled-text': tokens.themes.light.state.disabled.text,
  '--button-transition-duration': tokens.themes.light.state.hover.duration,
  '--button-transition-easing': tokens.themes.light.state.hover.easing,
  fontFamily: tokens.typography.role.label.md.fontFamily,
  fontWeight: tokens.typography.role.label.md.fontWeight,
  letterSpacing: tokens.typography.role.label.md.letterSpacing
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className, style, type = 'button', ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={[
        'inline-flex items-center justify-center',
        'h-[var(--button-height)] px-[var(--button-padding-inline)]',
        'rounded-[var(--button-radius)] border border-[var(--button-border)]',
        'bg-[var(--button-bg)] text-[var(--button-text)] text-[length:var(--button-font-size)]',
        'transition-colors duration-[var(--button-transition-duration)] ease-[var(--button-transition-easing)]',
        'hover:bg-[var(--button-bg-hover)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-focus-ring)] focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:border-[var(--button-disabled-border)] disabled:bg-[var(--button-disabled-bg)] disabled:text-[var(--button-disabled-text)]',
        className
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ ...baseStyle, ...sizeStyles[size], ...variantStyles[variant], ...style }}
      {...props}
    />
  );
});
