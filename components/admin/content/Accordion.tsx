'use client';

import {
  Accordion as MantineAccordion,
} from '@mantine/core';
import { type ReactNode } from 'react';

export interface AccordionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function Accordion({
  title,
  children,
  defaultOpen = false,
  className,
  style,
}: AccordionProps) {
  return (
    <MantineAccordion
      defaultValue={defaultOpen ? 'item' : undefined}
      variant="default"
      className={className}
      style={style}
    >
      <MantineAccordion.Item value="item">
        <MantineAccordion.Control>{title}</MantineAccordion.Control>
        <MantineAccordion.Panel>{children}</MantineAccordion.Panel>
      </MantineAccordion.Item>
    </MantineAccordion>
  );
}
