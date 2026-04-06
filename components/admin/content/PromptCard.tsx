'use client';

import { Button, Group, Paper, Stack, Text } from '@mantine/core';
import { type CSSProperties } from 'react';

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

export function PromptCard({
  title,
  description,
  status,
  tags,
  onEdit,
  onDelete,
  className,
  style,
}: PromptCardProps) {
  const hasActions = onEdit != null || onDelete != null;
  const hasTags = tags != null && tags.length > 0;

  return (
    <Paper
      withBorder
      p="lg"
      radius="md"
      className={className}
      style={style}
    >
      <Stack gap="sm">
        {/* Header */}
        <Group justify="space-between" gap="sm">
          <Text size="lg" fw={600} lh={1.2}>{title}</Text>
          {status != null && <StatusBadge status={status} />}
        </Group>

        {/* Description */}
        {description != null && (
          <Text size="sm" c="dimmed">{description}</Text>
        )}

        {/* Tags */}
        {hasTags && (
          <Group gap="xs">
            {tags!.map(tag => (
              <Tag key={tag} label={tag} />
            ))}
          </Group>
        )}

        {/* Actions */}
        {hasActions && (
          <Group justify="flex-end" gap="sm">
            {onEdit != null && (
              <Button variant="subtle" size="sm" onClick={onEdit}>
                Edit
              </Button>
            )}
            {onDelete != null && (
              <Button variant="filled" color="red" size="sm" onClick={onDelete}>
                Delete
              </Button>
            )}
          </Group>
        )}
      </Stack>
    </Paper>
  );
}
