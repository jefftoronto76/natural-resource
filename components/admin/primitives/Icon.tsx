import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

import { tokens, type ThemeStyle } from '../theme/tokens';

type IconSize = 'sm' | 'md' | 'lg';
type IconVariant = 'default' | 'muted';

export interface IconProps extends HTMLAttributes<HTMLSpanElement> {
  size?: IconSize;
  variant?: IconVariant;
  label?: string;
  children: ReactNode;
}

const sizeStyles: Record<IconSize, ThemeStyle> = {
  sm: { '--icon-size': tokens.spacing.inline.md },
  md: { '--icon-size': tokens.spacing.inline.lg },
  lg: { '--icon-size': tokens.spacing.inset.lg }
};

const variantStyles: Record<IconVariant, ThemeStyle> = {
  default: { '--icon-color': tokens.themes.light.color.icon.primary },
  muted: { '--icon-color': tokens.themes.light.color.icon.muted }
};

const baseStyle: ThemeStyle = {
  '--icon-transition-duration': tokens.themes.light.state.hover.duration,
  '--icon-transition-easing': tokens.themes.light.state.hover.easing
};

export const Icon = forwardRef<HTMLSpanElement, IconProps>(function Icon(
  { size = 'md', variant = 'default', label, className, style, children, ...props },
  ref
) {
  const ariaProps = label
    ? { role: 'img', 'aria-label': label }
    : { 'aria-hidden': true as const };

  return (
    <span
      ref={ref}
      className={[
        'inline-flex shrink-0 items-center justify-center',
        'h-[var(--icon-size)] w-[var(--icon-size)] text-[var(--icon-color)]',
        'transition-colors duration-[var(--icon-transition-duration)] ease-[var(--icon-transition-easing)]',
        '[&>svg]:h-full [&>svg]:w-full [&>svg]:fill-current [&>svg]:stroke-current',
        className
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ ...baseStyle, ...sizeStyles[size], ...variantStyles[variant], ...style }}
      {...ariaProps}
      {...props}
    >
      {children}
    </span>
  );
});
