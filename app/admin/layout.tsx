import { Suspense } from 'react';
import { UserButton } from '@clerk/nextjs';
import { MantineProvider, ColorSchemeScript, AppShell, Text, Stack } from '@mantine/core';

import '@mantine/core/styles.css';

import { adminTheme } from '@/components/admin/theme/mantine-theme';
import { AdminSidebarNav } from '@/components/admin/navigation/AdminSidebarNav';
import { AdminUserProvider } from '@/context/admin-user';
import { syncUser } from '@/lib/sync-user';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabaseUserId = await syncUser()

  return (
    <AdminUserProvider supabaseUserId={supabaseUserId}>
      <MantineProvider theme={adminTheme}>
        <ColorSchemeScript defaultColorScheme="light" />
        <AppShell
          navbar={{
            width: 240,
            breakpoint: 'md',
          }}
          padding="lg"
        >
          <AppShell.Navbar
            p="sm"
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

            {/* Navigation */}
            <AppShell.Section grow style={{ overflowY: 'auto' }}>
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
      </MantineProvider>
    </AdminUserProvider>
  );
}
