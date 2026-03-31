import { type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';

import { tokens } from '../theme/tokens';

export interface MainPanelProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

const baseStyle: CSSProperties = {
  '--main-panel-bg': tokens.themes.light.color.surface.canvas
} as CSSProperties;

export function MainPanel({
  children,
  className,
  style,
  ...props
}: MainPanelProps) {
  return (
    <main
      className={[
        'h-full overflow-y-auto',
        'bg-[var(--main-panel-bg)]',
        className
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ ...baseStyle, ...style }}
      {...props}
    >
      {children}
    </main>
  );
}
