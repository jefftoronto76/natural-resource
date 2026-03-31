import { type CSSProperties } from 'react';

import { Button } from '../primitives/Button';
import { Card } from '../primitives/Card';
import { Text } from '../primitives/Text';
import { tokens } from '../theme/tokens';
import { StatusBadge, type Status } from './StatusBadge';
import { Tag } from './Tag';

export interface PromptCardProps {
  title: string;
  description?: string;
  status?: Status;
  tags?: string[];
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
  style?: CSSProperties;
}

const baseStyle: CSSProperties = {
  '--prompt-card-gap': tokens.spacing.stack.sm,
  '--prompt-card-tags-gap': tokens.spacing.gap.xs,
  '--prompt-card-actions-gap': tokens.spacing.gap.sm
} as CSSProperties;

export function PromptCard({
  title,
  description,
  status,
  tags,
  onEdit,
  onDelete,
  className,
  style
}: PromptCardProps) {
  const hasActions = onEdit != null || onDelete != null;
  const hasTags = tags != null && tags.length > 0;

  return (
    <Card
      variant="outlined"
      className={['flex flex-col gap-[var(--prompt-card-gap)]', className]
        .filter(Boolean)
        .join(' ')}
      style={{ ...baseStyle, ...style }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-[var(--prompt-card-actions-gap)]">
        <Text variant="title">{title}</Text>
        {status != null && <StatusBadge status={status} />}
      </div>

      {/* Description */}
      {description != null && (
        <Text variant="muted">{description}</Text>
      )}

      {/* Tags */}
      {hasTags && (
        <div className="flex flex-wrap gap-[var(--prompt-card-tags-gap)]">
          {tags!.map(tag => (
            <Tag key={tag} label={tag} />
          ))}
        </div>
      )}

      {/* Actions */}
      {hasActions && (
        <div className="flex justify-end gap-[var(--prompt-card-actions-gap)]">
          {onEdit != null && (
            <Button variant="ghost" size="sm" onClick={onEdit}>
              Edit
            </Button>
          )}
          {onDelete != null && (
            <Button variant="danger" size="sm" onClick={onDelete}>
              Delete
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
