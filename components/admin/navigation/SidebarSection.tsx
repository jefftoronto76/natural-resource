import { type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';

import { Text } from '../primitives/Text';
import { tokens } from '../theme/tokens';

export interface SidebarSectionProps extends HTMLAttributes<HTMLElement> {
  label?: string;
  children: ReactNode;
}

const baseStyle: CSSProperties = {
  '--sidebar-section-gap': tokens.spacing.gap.xs,
  '--sidebar-section-label-gap': tokens.spacing.stack.xs
} as CSSProperties;

export function SidebarSection({
  label,
  children,
  className,
  style,
  ...props
}: SidebarSectionProps) {
  return (
    <section
      aria-label={label}
      className={['flex flex-col gap-[var(--sidebar-section-gap)]', className]
        .filter(Boolean)
        .join(' ')}
      style={{ ...baseStyle, ...style }}
      {...props}
    >
      {label != null && (
        <Text
          variant="muted"
          style={{ marginBottom: 'var(--sidebar-section-label-gap)' }}
        >
          {label}
        </Text>
      )}
      {children}
    </section>
  );
}
