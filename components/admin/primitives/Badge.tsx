'use client';

import {
  Badge as MantineBadge,
  type BadgeProps as MantineBadgeProps,
} from '@mantine/core';
import { forwardRef, type HTMLAttributes } from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger';
type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const variantMap: Record<BadgeVariant, { color: string }> = {
  default: { color: 'gray' },
  success: { color: 'green' },
  warning: { color: 'yellow' },
  danger: { color: 'red' },
};

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(function Badge(
  { variant = 'default', size = 'md', className, style, children, ...props },
  ref
) {
  const mapped = variantMap[variant];

  return (
    <MantineBadge
      ref={ref}
      variant="light"
      color={mapped.color}
      size={size}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </MantineBadge>
  );
});
