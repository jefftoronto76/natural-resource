'use client';

import { Suspense, type ReactNode } from 'react';
import { AppShell, Burger, Group, Text, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { UserButton } from '@clerk/nextjs';
import { AdminSidebarNav } from '@/components/admin/navigation/AdminSidebarNav';

export interface AdminShellProps {
  children: ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const [opened, { toggle, close }] = useDisclosure();

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
            hiddenFrom="md"
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
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
