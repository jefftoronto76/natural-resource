import { type CSSProperties, type ReactNode } from 'react';

import { Icon } from '../primitives/Icon';
import { Text } from '../primitives/Text';
import { tokens } from '../theme/tokens';

export interface SidebarItemProps {
  label: string;
  icon?: ReactNode;
  isActive?: boolean;
  onClick: () => void;
  className?: string;
  style?: CSSProperties;
}

const baseStyle: CSSProperties = {
  '--sidebar-item-radius': tokens.radius.md,
  '--sidebar-item-padding-inline': tokens.spacing.inline.md,
  '--sidebar-item-padding-block': tokens.spacing.inline.sm,
  '--sidebar-item-gap': tokens.spacing.gap.sm,
  '--sidebar-item-accent-width': tokens.border.width.accent,
  '--sidebar-item-hover-surface': tokens.themes.dark.state.hover.surface,
  '--sidebar-item-inactive-text': tokens.themes.dark.color.text.muted,
  '--sidebar-item-active-surface': tokens.themes.dark.state.selected.surface,
  '--sidebar-item-active-text': tokens.themes.dark.state.selected.text,
  '--sidebar-item-active-border': tokens.themes.dark.state.selected.border,
  '--sidebar-item-transition-duration': tokens.themes.dark.state.hover.duration,
  '--sidebar-item-transition-easing': tokens.themes.dark.state.hover.easing
} as CSSProperties;

export function SidebarItem({
  label,
  icon,
  isActive = false,
  onClick,
  className,
  style
}: SidebarItemProps) {
  return (
    <button
      type="button"
      aria-current={isActive ? 'page' : undefined}
      onClick={onClick}
      className={[
        'flex w-full cursor-pointer items-center border-none',
        'gap-[var(--sidebar-item-gap)]',
        'rounded-[var(--sidebar-item-radius)]',
        'px-[var(--sidebar-item-padding-inline)] py-[var(--sidebar-item-padding-block)]',
        'border-l-[length:var(--sidebar-item-accent-width)]',
        'transition-colors duration-[var(--sidebar-item-transition-duration)] ease-[var(--sidebar-item-transition-easing)]',
        isActive
          ? 'border-l-[var(--sidebar-item-active-border)] bg-[var(--sidebar-item-active-surface)]'
          : 'border-l-transparent bg-transparent hover:bg-[var(--sidebar-item-hover-surface)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sidebar-item-active-border)]',
        className
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ ...baseStyle, ...style }}
    >
      {icon != null && (
        <Icon size="sm" variant={isActive ? 'default' : 'muted'}>
          {icon}
        </Icon>
      )}
      <Text
        variant="label"
        style={{
          color: isActive
            ? 'var(--sidebar-item-active-text)'
            : 'var(--sidebar-item-inactive-text)'
        }}
      >
        {label}
      </Text>
    </button>
  );
}
