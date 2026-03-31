import { type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';

import { tokens } from '../theme/tokens';

export interface SidebarProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
}

const baseStyle: CSSProperties = {
  '--sidebar-width': tokens.layout.sidebar.width,
  '--sidebar-bg': tokens.themes.dark.color.surface.canvas,
  '--sidebar-border': tokens.themes.dark.color.border.subtle,
  '--sidebar-padding': tokens.spacing.inset.sm
} as CSSProperties;

export function Sidebar({
  children,
  header,
  footer,
  className,
  style,
  ...props
}: SidebarProps) {
  return (
    <nav
      className={[
        'flex h-full w-[var(--sidebar-width)] shrink-0 flex-col',
        'border-r border-r-[var(--sidebar-border)] bg-[var(--sidebar-bg)]',
        className
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ ...baseStyle, ...style }}
      {...props}
    >
      {header != null && (
        <div className="shrink-0 p-[var(--sidebar-padding)]">
          {header}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto p-[var(--sidebar-padding)]">
        {children}
      </div>

      {footer != null && (
        <div className="shrink-0 p-[var(--sidebar-padding)]">
          {footer}
        </div>
      )}
    </nav>
  );
}
