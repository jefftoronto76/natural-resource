'use client';

import { Paper, type PaperProps } from '@mantine/core';
import { forwardRef, type HTMLAttributes } from 'react';

type CardVariant = 'default' | 'outlined' | 'interactive';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const variantMap: Record<CardVariant, Partial<PaperProps>> = {
  default: {
    shadow: 'xs',
    withBorder: false,
  },
  outlined: {
    shadow: undefined,
    withBorder: true,
  },
  interactive: {
    shadow: undefined,
    withBorder: true,
  },
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = 'default', className, style, children, ...props },
  ref
) {
  const mapped = variantMap[variant];

  return (
    <Paper
      ref={ref}
      p="lg"
      radius="md"
      withBorder={mapped.withBorder}
      shadow={mapped.shadow}
      className={[
        variant === 'interactive' ? 'transition-shadow hover:shadow-sm' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
      {...props}
    >
      {children}
    </Paper>
  );
});
