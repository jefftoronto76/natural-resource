import { type CSSProperties } from 'react';

import { Button } from '../primitives/Button';
import { Icon } from '../primitives/Icon';
import { tokens } from '../theme/tokens';

export interface AddBlockButtonProps {
  onClick: () => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function AddBlockButton({
  onClick,
  label = 'Add block',
  disabled,
  className,
  style
}: AddBlockButtonProps) {
  return (
    <Button
      variant="ghost"
      size="md"
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{ gap: tokens.spacing.gap.xs, ...style }}
    >
      <Icon size="sm" aria-hidden>
        <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 3v10M3 8h10" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </Icon>
      {label}
    </Button>
  );
}
