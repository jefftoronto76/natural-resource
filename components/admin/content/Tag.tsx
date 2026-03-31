import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';

import { Icon } from '../primitives/Icon';
import { Text } from '../primitives/Text';
import { tokens } from '../theme/tokens';

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  label: string;
  onRemove?: () => void;
}

const baseStyle: CSSProperties = {
  '--tag-bg': tokens.themes.light.color.surface.elevated,
  '--tag-border': tokens.themes.light.color.border.subtle,
  '--tag-radius': tokens.radius.md,
  '--tag-gap': tokens.spacing.gap.xs,
  '--tag-padding-inline': tokens.spacing.inline.md,
  '--tag-padding-block': tokens.spacing.inline.xs,
  '--tag-remove-color': tokens.themes.light.color.icon.muted,
  '--tag-remove-hover-color': tokens.themes.light.color.text.primary,
  '--tag-transition-duration': tokens.themes.light.state.hover.duration,
  '--tag-transition-easing': tokens.themes.light.state.hover.easing
} as CSSProperties;

export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag(
  { label, onRemove, className, style, ...props },
  ref
) {
  return (
    <span
      ref={ref}
      className={[
        'inline-flex items-center gap-[var(--tag-gap)]',
        'rounded-[var(--tag-radius)] border border-[var(--tag-border)] bg-[var(--tag-bg)]',
        'px-[var(--tag-padding-inline)] py-[var(--tag-padding-block)]',
        className
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ ...baseStyle, ...style }}
      {...props}
    >
      <Text variant="label">{label}</Text>
      {onRemove != null && (
        <button
          type="button"
          onClick={onRemove}
          className={[
            'inline-flex cursor-pointer items-center justify-center border-none bg-transparent p-0',
            'text-[var(--tag-remove-color)]',
            'transition-colors duration-[var(--tag-transition-duration)] ease-[var(--tag-transition-easing)]',
            'hover:text-[var(--tag-remove-hover-color)]',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--tag-remove-hover-color)]'
          ].join(' ')}
          aria-label={`Remove ${label}`}
        >
          <Icon size="sm" variant="muted" label={`Remove ${label}`}>
            <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M4 4l8 8M12 4l-8 8"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </Icon>
        </button>
      )}
    </span>
  );
});
