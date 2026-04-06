'use client';

import {
  Button as MantineButton,
  type ButtonProps as MantineButtonProps,
} from '@mantine/core';
import { forwardRef, type ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  color?: string;
  leftSection?: React.ReactNode;
}

const variantMap: Record<ButtonVariant, { variant: MantineButtonProps['variant']; color?: string }> = {
  primary: { variant: 'filled' },
  secondary: { variant: 'default' },
  ghost: { variant: 'subtle' },
  danger: { variant: 'filled', color: 'red' },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', color, type = 'button', leftSection, ...props },
  ref
) {
  const mapped = variantMap[variant];

  return (
    <MantineButton
      ref={ref}
      variant={mapped.variant}
      color={color ?? mapped.color}
      size={size}
      type={type}
      leftSection={leftSection}
      {...props}
    />
  );
});
