'use client';

import { Suspense, type ReactNode, useEffect } from 'react';
import { AppShell, Burger, Overlay, Text, Stack } from '@mantine/core';
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
      navbar={{
        width: 240,
        breakpoint: 'md',
        collapsed: { mobile: !opened },
      }}
      padding="lg"
    >
      {/* Mobile burger — fixed top-left, hidden on desktop */}
      <Burger
        opened={opened}
        onClick={toggle}
        hiddenFrom="md"
        size="sm"
        color={opened ? 'white' : undefined}
        aria-label="Toggle navigation"
        style={{
          position: 'fixed',
          top: 12,
          left: 12,
          zIndex: 300,
        }}
      />

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

      <AppShell.Navbar
        p="sm"
        data-mantine-color-scheme="dark"
        style={{
          backgroundColor: 'var(--mantine-color-dark-9)',
          borderRight: '1px solid var(--mantine-color-dark-6)',
        }}
      >
        {/* Wordmark — extra top margin on mobile to clear the burger */}
        <AppShell.Section mt={{ base: 44, md: 0 }}>
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
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
