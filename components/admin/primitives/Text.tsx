'use client';

import {
  Text as MantineText,
  type TextProps as MantineTextProps,
} from '@mantine/core';
import { forwardRef, type HTMLAttributes } from 'react';

type TextVariant = 'body' | 'label' | 'title' | 'muted';

export interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  variant?: TextVariant;
}

const variantMap: Record<TextVariant, Partial<MantineTextProps>> = {
  body: {
    size: 'md',
  },
  label: {
    size: 'sm',
    fw: 500,
    lh: 1.2,
  },
  title: {
    size: 'lg',
    fw: 600,
    lh: 1.2,
  },
  muted: {
    size: 'sm',
    c: 'dimmed',
  },
};

export const Text = forwardRef<HTMLParagraphElement, TextProps>(function Text(
  { variant = 'body', className, style, children, ...props },
  ref
) {
  const mapped = variantMap[variant];

  return (
    <MantineText
      ref={ref}
      component="p"
      className={className}
      style={{ margin: 0, ...style }}
      {...mapped}
      {...props}
    >
      {children}
    </MantineText>
  );
});
