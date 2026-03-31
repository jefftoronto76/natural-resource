'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { SidebarSection } from './SidebarSection';
import { SidebarItem } from './SidebarItem';

const NAV_ITEMS = [
  { label: 'Sessions',        href: '/admin' },
  { label: 'Prompt',          href: '/admin/prompt' },
  { label: 'Prompt Builder',  href: '/admin/prompt-builder' },
] as const;

const CANVAS_ITEMS = [
  { label: 'Guardrails', key: 'guardrails' },
  { label: 'Knowledge',  key: 'knowledge' },
  { label: 'Prompts',    key: 'prompts' },
] as const;

export function AdminSidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const isPromptBuilder = pathname === '/admin/prompt-builder';
  const activeCanvas = searchParams.get('canvas') ?? 'prompts';

  return (
    <SidebarSection>
      {NAV_ITEMS.map(({ label, href }) => (
        <div key={href}>
          <SidebarItem
            label={label}
            isActive={pathname === href}
            onClick={() => router.push(href)}
          />
          {href === '/admin/prompt-builder' && isPromptBuilder && (
            <div style={{ paddingLeft: '12px', marginTop: '2px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {CANVAS_ITEMS.map(({ label: subLabel, key }) => (
                <SidebarItem
                  key={key}
                  label={subLabel}
                  isActive={activeCanvas === key}
                  onClick={() => router.push(`/admin/prompt-builder?canvas=${key}`)}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </SidebarSection>
  );
}
