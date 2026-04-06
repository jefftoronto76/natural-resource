'use client';

import { Stack, Text } from '@mantine/core';
import { type ReactNode } from 'react';

export interface SidebarSectionProps {
  label?: string;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function SidebarSection({
  label,
  children,
  className,
  style,
}: SidebarSectionProps) {
  return (
    <Stack
      component="section"
      gap="xs"
      aria-label={label}
      className={className}
      style={style}
    >
      {label != null && (
        <Text size="xs" c="dimmed" fw={500} mb={2}>
          {label}
        </Text>
      )}
      {children}
    </Stack>
  );
}
