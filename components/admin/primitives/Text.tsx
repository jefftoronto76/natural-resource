import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';

import { tokens } from '../theme/tokens';

type TextVariant = 'body' | 'label' | 'title' | 'muted';

export interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  variant?: TextVariant;
}

const variantStyles: Record<TextVariant, CSSProperties> = {
  body: {
    '--text-color': tokens.themes.light.color.text.primary,
    fontFamily: tokens.typography.role.body.md.fontFamily,
    fontSize: tokens.typography.role.body.md.fontSize,
    lineHeight: String(tokens.typography.role.body.md.lineHeight),
    fontWeight: tokens.typography.role.body.md.fontWeight,
    letterSpacing: tokens.typography.role.body.md.letterSpacing
  },
  label: {
    '--text-color': tokens.themes.light.color.text.primary,
    fontFamily: tokens.typography.role.label.md.fontFamily,
    fontSize: tokens.typography.role.label.md.fontSize,
    lineHeight: String(tokens.typography.role.label.md.lineHeight),
    fontWeight: tokens.typography.role.label.md.fontWeight,
    letterSpacing: tokens.typography.role.label.md.letterSpacing
  },
  title: {
    '--text-color': tokens.themes.light.color.text.primary,
    fontFamily: tokens.typography.role.title.md.fontFamily,
    fontSize: tokens.typography.role.title.md.fontSize,
    lineHeight: String(tokens.typography.role.title.md.lineHeight),
    fontWeight: tokens.typography.role.title.md.fontWeight,
    letterSpacing: tokens.typography.role.title.md.letterSpacing
  },
  muted: {
    '--text-color': tokens.themes.light.color.text.muted,
    fontFamily: tokens.typography.role.body.sm.fontFamily,
    fontSize: tokens.typography.role.body.sm.fontSize,
    lineHeight: String(tokens.typography.role.body.sm.lineHeight),
    fontWeight: tokens.typography.role.body.sm.fontWeight,
    letterSpacing: tokens.typography.role.body.sm.letterSpacing
  }
};

export const Text = forwardRef<HTMLParagraphElement, TextProps>(function Text(
  { variant = 'body', className, style, ...props },
  ref
) {
  return (
    <p
      ref={ref}
      className={['m-0 text-[var(--text-color)]', className].filter(Boolean).join(' ')}
      style={{ ...variantStyles[variant], ...style }}
      {...props}
    />
  );
});
