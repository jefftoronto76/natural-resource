'use client';

import { usePathname, useRouter } from 'next/navigation';

import { SidebarSection } from './SidebarSection';
import { SidebarItem } from './SidebarItem';

const NAV_ITEMS = [
  { label: 'Sessions',        href: '/admin' },
  { label: 'Prompt',          href: '/admin/prompt' },
  { label: 'Prompt Builder',  href: '/admin/prompt-builder' },
] as const;

export function AdminSidebarNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <SidebarSection>
      {NAV_ITEMS.map(({ label, href }) => (
        <SidebarItem
          key={href}
          label={label}
          isActive={pathname === href}
          onClick={() => router.push(href)}
        />
      ))}
    </SidebarSection>
  );
}
