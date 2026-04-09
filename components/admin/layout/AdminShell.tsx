'use client';

import { Suspense, type ReactNode, useEffect } from 'react';
import { AppShell, Burger, Group, Overlay, Text, Stack } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { UserButton } from '@clerk/nextjs';
import { AdminSidebarNav } from '@/components/admin/navigation/AdminSidebarNav';

export interface AdminShellProps {
  children: ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const [opened, { toggle, close }] = useDisclosure();
  const isDesktop = useMediaQuery('(min-width: 62em)');

  // Auto-close mobile nav when viewport crosses to desktop
  useEffect(() => {
    if (isDesktop) close();
  }, [isDesktop, close]);

  return (
    <AppShell
      header={{ height: 48 }}
      navbar={{
        width: 240,
        breakpoint: 'md',
        collapsed: { mobile: !opened },
      }}
      padding="lg"
    >
      {/* Mobile-only header with burger — hidden on desktop, 0-height on desktop */}
      <AppShell.Header
        style={{
          backgroundColor: 'var(--mantine-color-white)',
          borderBottom: '1px solid var(--mantine-color-gray-2)',
        }}
      >
        <Group h="100%" px="md">
          <Burger
            opened={opened}
            onClick={toggle}
            size="sm"
            aria-label="Toggle navigation"
          />
        </Group>
      </AppShell.Header>

      <AppShell.Navbar
        p="sm"
        data-mantine-color-scheme="dark"
        style={{
          backgroundColor: 'var(--mantine-color-dark-9)',
          borderRight: '1px solid var(--mantine-color-dark-6)',
        }}
      >
        {/* Wordmark */}
        <AppShell.Section>
          <div style={{ padding: 'var(--mantine-spacing-sm)' }}>
            <Text
              size="md"
              fw={400}
              c="gray.1"
              style={{
                fontFamily: 'var(--mantine-font-family-headings)',
                letterSpacing: '-0.01em',
              }}
            >
              Natural Resource
            </Text>
            <Text
              size="xs"
              c="green.6"
              style={{
                fontFamily: 'var(--mantine-font-family-monospace)',
                fontSize: '9px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
              }}
            >
              Admin
            </Text>
          </div>
        </AppShell.Section>

        {/* Navigation — close drawer on link click */}
        <AppShell.Section grow style={{ overflowY: 'auto' }} onClick={close}>
          <Suspense>
            <AdminSidebarNav />
          </Suspense>
        </AppShell.Section>

        {/* Footer — Clerk UserButton */}
        <AppShell.Section>
          <Stack p="sm">
            <UserButton />
          </Stack>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main
        style={{
          backgroundColor: 'var(--mantine-color-white)',
        }}
      >
        {/* Mobile overlay — tap outside navbar to close */}
        {opened && (
          <Overlay
            onClick={close}
            fixed
            zIndex={199}
            backgroundOpacity={0.5}
            hiddenFrom="md"
          />
        )}
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
