import { type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';

import { tokens } from '../theme/tokens';

export interface SectionContainerProps extends HTMLAttributes<HTMLElement> {
  header?: ReactNode;
  children: ReactNode;
}

const baseStyle: CSSProperties = {
  '--section-padding': tokens.spacing.inset.lg,
  '--section-gap': tokens.spacing.stack.md
} as CSSProperties;

export function SectionContainer({
  header,
  children,
  className,
  style,
  ...props
}: SectionContainerProps) {
  return (
    <section
      className={[
        'flex flex-col',
        'p-[var(--section-padding)]',
        header != null ? 'gap-[var(--section-gap)]' : '',
        className
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ ...baseStyle, ...style }}
      {...props}
    >
      {header != null && <div>{header}</div>}
      {children}
    </section>
  );
}
