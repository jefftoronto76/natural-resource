'use client';

import { Badge } from '@mantine/core';
import { type CSSProperties } from 'react';

export type Status = 'active' | 'inactive' | 'draft' | 'pending' | 'error';

export interface StatusBadgeProps {
  status: Status;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
  style?: CSSProperties;
}

const statusConfig: Record<Status, { color: string; label: string }> = {
  active: { color: 'green', label: 'Active' },
  inactive: { color: 'gray', label: 'Inactive' },
  draft: { color: 'gray', label: 'Draft' },
  pending: { color: 'yellow', label: 'Pending' },
  error: { color: 'red', label: 'Error' },
};

export function StatusBadge({ status, label, size = 'md', className, style }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant="light"
      color={config.color}
      size={size}
      className={className}
      style={style}
    >
      {label ?? config.label}
    </Badge>
  );
}
