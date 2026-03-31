import { type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';

export interface AppLayoutProps extends HTMLAttributes<HTMLDivElement> {
  sidebar: ReactNode;
  children: ReactNode;
}

export function AppLayout({
  sidebar,
  children,
  className,
  style,
  ...props
}: AppLayoutProps) {
  return (
    <div
      className={['flex h-screen flex-row overflow-hidden', className]
        .filter(Boolean)
        .join(' ')}
      style={style as CSSProperties}
      {...props}
    >
      {sidebar}
      <div className="min-w-0 flex-1">
        {children}
      </div>
    </div>
  );
}
