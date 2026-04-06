'use client';

import { Button, Tooltip } from '@mantine/core';
import { type CSSProperties } from 'react';

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
  style,
}: AddBlockButtonProps) {
  const button = (
    <Button
      variant="subtle"
      size="md"
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={style}
      leftSection={
        <svg
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
          width={14}
          height={14}
          fill="none"
          stroke="currentColor"
        >
          <path d="M8 3v10M3 8h10" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      }
    >
      {label}
    </Button>
  );

  if (disabled) {
    return (
      <Tooltip label="Block name and content are required" position="bottom">
        <span>{button}</span>
      </Tooltip>
    );
  }

  return button;
}
