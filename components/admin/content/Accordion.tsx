import { useState, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';

import { Icon } from '../primitives/Icon';
import { Text } from '../primitives/Text';
import { tokens } from '../theme/tokens';

export interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

const headerBaseStyle: CSSProperties = {
  '--accordion-hover-surface': tokens.themes.light.state.hover.surface,
  '--accordion-border': tokens.themes.light.color.border.subtle,
  '--accordion-radius': tokens.radius.md,
  '--accordion-padding': tokens.spacing.inset.sm,
  '--accordion-gap': tokens.spacing.gap.sm,
  '--accordion-transition-duration': tokens.themes.light.state.hover.duration,
  '--accordion-transition-easing': tokens.themes.light.state.hover.easing
} as CSSProperties;

const contentTransitionStyle = (open: boolean): CSSProperties => ({
  maxHeight: open ? '9999px' : '0px',
  overflow: 'hidden',
  transitionProperty: 'max-height',
  transitionDuration: open
    ? tokens.motion.transition.enter.duration
    : tokens.motion.transition.exit.duration,
  transitionTimingFunction: open
    ? tokens.motion.transition.enter.easing
    : tokens.motion.transition.exit.easing
});

const chevronStyle = (open: boolean): CSSProperties => ({
  transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
  transitionProperty: 'transform',
  transitionDuration: tokens.motion.transition.enter.duration,
  transitionTimingFunction: tokens.motion.transition.enter.easing
});

export function Accordion({
  title,
  children,
  defaultOpen = false,
  className,
  style,
  ...props
}: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={['flex flex-col', className].filter(Boolean).join(' ')}
      style={style}
      {...props}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(prev => !prev)}
        className={[
          'flex w-full cursor-pointer items-center justify-between border-none bg-transparent',
          'rounded-[var(--accordion-radius)] p-[var(--accordion-padding)]',
          'gap-[var(--accordion-gap)]',
          'transition-colors duration-[var(--accordion-transition-duration)] ease-[var(--accordion-transition-easing)]',
          'hover:bg-[var(--accordion-hover-surface)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accordion-border)]'
        ].join(' ')}
        style={headerBaseStyle}
      >
        <Text variant="label">{title}</Text>
        <Icon size="sm" variant="muted" style={chevronStyle(open)}>
          <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6l5 5 5-5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Icon>
      </button>

      <div style={contentTransitionStyle(open)}>
        {children}
      </div>
    </div>
  );
}
