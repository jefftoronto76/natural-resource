'use client';

import { NavLink } from '@mantine/core';
import { type CSSProperties, type ReactNode } from 'react';

export interface SidebarItemProps {
  label: string;
  icon?: ReactNode;
  isActive?: boolean;
  onClick: () => void;
  className?: string;
  style?: CSSProperties;
}

export function SidebarItem({
  label,
  icon,
  isActive = false,
  onClick,
  className,
  style,
}: SidebarItemProps) {
  return (
    <NavLink
      label={label}
      active={isActive}
      onClick={onClick}
      leftSection={icon}
      variant="subtle"
      aria-current={isActive ? 'page' : undefined}
      className={className}
      style={{
        borderRadius: 'var(--mantine-radius-sm)',
        '--nl-color': isActive
          ? 'var(--mantine-color-white)'
          : 'var(--mantine-color-gray-5)',
        '--nl-bg': isActive
          ? 'var(--mantine-color-green-filled)'
          : 'transparent',
        '--nl-hover': 'rgba(255,255,255,0.06)',
        ...style,
      } as CSSProperties}
    />
  );
}
