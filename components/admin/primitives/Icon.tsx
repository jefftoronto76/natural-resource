'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

type IconSize = 'sm' | 'md' | 'lg';
type IconVariant = 'default' | 'muted';

export interface IconProps extends HTMLAttributes<HTMLSpanElement> {
  size?: IconSize;
  variant?: IconVariant;
  label?: string;
  children: ReactNode;
}

const sizeMap: Record<IconSize, string> = {
  sm: 'var(--mantine-spacing-md)',
  md: 'var(--mantine-spacing-lg)',
  lg: 'var(--mantine-spacing-xl)',
};

const variantColorMap: Record<IconVariant, string> = {
  default: 'var(--mantine-color-dark-6)',
  muted: 'var(--mantine-color-gray-5)',
};

export const Icon = forwardRef<HTMLSpanElement, IconProps>(function Icon(
  { size = 'md', variant = 'default', label, className, style, children, ...props },
  ref
) {
  const ariaProps = label
    ? { role: 'img' as const, 'aria-label': label }
    : { 'aria-hidden': true as const };

  const iconSize = sizeMap[size];

  return (
    <span
      ref={ref}
      className={[
        'inline-flex shrink-0 items-center justify-center',
        '[&>svg]:h-full [&>svg]:w-full [&>svg]:fill-current [&>svg]:stroke-current',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        width: iconSize,
        height: iconSize,
        color: variantColorMap[variant],
        transition: 'color 120ms ease',
        ...style,
      }}
      {...ariaProps}
      {...props}
    >
      {children}
    </span>
  );
});
