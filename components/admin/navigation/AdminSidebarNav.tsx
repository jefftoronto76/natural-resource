'use client';

import { NavLink, Stack } from '@mantine/core';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'Sessions',       href: '/admin' },
  { label: 'Prompt',         href: '/admin/prompt' },
  { label: 'Prompt Builder', href: '/admin/prompt-builder' },
] as const;

const CANVAS_ITEMS = [
  { label: 'Guardrails', key: 'guardrails' },
  { label: 'Knowledge',  key: 'knowledge' },
  { label: 'Prompts',    key: 'prompts' },
] as const;

const navLinkStyle = (isActive: boolean) => ({
  borderRadius: 'var(--mantine-radius-sm)',
  // Default text color for all states (inactive inherits this)
  color: isActive
    ? 'var(--mantine-color-white)'
    : 'var(--mantine-color-gray-4)',
  // Active-state variables (only apply when [data-active])
  '--nl-color': 'var(--mantine-color-white)',
  '--nl-bg': 'var(--mantine-color-green-filled)',
  '--nl-hover': 'var(--mantine-color-green-filled-hover)',
} as React.CSSProperties);

export function AdminSidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const isPromptBuilder = pathname === '/admin/prompt-builder';
  const activeCanvas = searchParams.get('canvas') ?? 'prompts';

  return (
    <Stack gap="xs" component="section" aria-label="Admin navigation">
      {NAV_ITEMS.map(({ label, href }) => (
        <div key={href}>
          <NavLink
            label={label}
            active={pathname === href}
            onClick={() => router.push(href)}
            variant="subtle"
            aria-current={pathname === href ? 'page' : undefined}
            style={navLinkStyle(pathname === href)}
          />
          {href === '/admin/prompt-builder' && isPromptBuilder && (
            <Stack gap={2} ml="md" mt={2}>
              {CANVAS_ITEMS.map(({ label: subLabel, key }) => (
                <NavLink
                  key={key}
                  label={subLabel}
                  active={activeCanvas === key}
                  onClick={() => router.push(`/admin/prompt-builder?canvas=${key}`)}
                  variant="subtle"
                  aria-current={activeCanvas === key ? 'page' : undefined}
                  style={navLinkStyle(activeCanvas === key)}
                />
              ))}
            </Stack>
          )}
        </div>
      ))}
    </Stack>
  );
}
