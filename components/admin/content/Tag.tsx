'use client';

import { Badge, CloseButton } from '@mantine/core';
import { forwardRef, type HTMLAttributes } from 'react';

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  label: string;
  onRemove?: () => void;
}

export const Tag = forwardRef<HTMLDivElement, TagProps>(function Tag(
  { label, onRemove, className, style, ...props },
  ref
) {
  return (
    <Badge
      ref={ref}
      variant="outline"
      color="gray"
      size="md"
      className={className}
      style={style}
      rightSection={
        onRemove != null ? (
          <CloseButton
            size="xs"
            variant="transparent"
            onClick={onRemove}
            aria-label={`Remove ${label}`}
          />
        ) : undefined
      }
      {...props}
    >
      {label}
    </Badge>
  );
});
