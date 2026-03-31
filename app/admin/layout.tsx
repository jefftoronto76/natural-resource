import { UserButton } from '@clerk/nextjs';

import { AppLayout } from '@/components/admin/layout/AppLayout';
import { Sidebar } from '@/components/admin/layout/Sidebar';
import { MainPanel } from '@/components/admin/layout/MainPanel';
import { AdminSidebarNav } from '@/components/admin/navigation/AdminSidebarNav';

const wordmark = (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
    <span style={{
      fontFamily: 'var(--font-display)',
      fontSize: '15px',
      fontWeight: 400,
      color: '#F9FAFB',
      letterSpacing: '-0.01em',
    }}>
      Natural Resource
    </span>
    <span style={{
      fontFamily: 'var(--font-mono)',
      fontSize: '9px',
      letterSpacing: '0.18em',
      color: 'var(--color-accent)',
    }}>
      Admin
    </span>
  </div>
);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppLayout
      sidebar={
        <div className="hidden md:flex h-full shrink-0">
          <Sidebar
            header={wordmark}
            footer={<UserButton />}
          >
            <AdminSidebarNav />
          </Sidebar>
        </div>
      }
    >
      <MainPanel>
        {children}
      </MainPanel>
    </AppLayout>
  );
}
