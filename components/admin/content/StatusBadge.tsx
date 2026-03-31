import { type CSSProperties } from 'react';

import { Badge, type BadgeProps } from '../primitives/Badge';

export type Status = 'active' | 'inactive' | 'draft' | 'pending' | 'error';

export interface StatusBadgeProps {
  status: Status;
  label?: string;
  size?: BadgeProps['size'];
  className?: string;
  style?: CSSProperties;
}

const statusVariant: Record<Status, BadgeProps['variant']> = {
  active: 'success',
  inactive: 'default',
  draft: 'default',
  pending: 'warning',
  error: 'danger'
};

const statusLabel: Record<Status, string> = {
  active: 'Active',
  inactive: 'Inactive',
  draft: 'Draft',
  pending: 'Pending',
  error: 'Error'
};

export function StatusBadge({ status, label, size = 'md', className, style }: StatusBadgeProps) {
  return (
    <Badge
      variant={statusVariant[status]}
      size={size}
      className={className}
      style={style}
    >
      {label ?? statusLabel[status]}
    </Badge>
  );
}
