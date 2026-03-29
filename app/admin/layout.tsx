import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', fontFamily: 'var(--font-body)' }}>
      {/* Admin nav */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(249,248,245,0.96)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)',
        padding: '0 clamp(24px, 5vw, 48px)', height: '60px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <Link href="/admin" style={{
            fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 400,
            color: 'var(--color-text-primary)', textDecoration: 'none',
          }}>
            Natural Resource
          </Link>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.18em',
            textTransform: 'uppercase', color: 'var(--color-accent)',
            border: '1px solid var(--color-accent)', padding: '3px 8px',
          }}>
            Admin
          </span>
          <nav style={{ display: 'flex', gap: '24px' }}>
            <Link href="/admin" style={{
              fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.15em',
              textTransform: 'uppercase', color: 'var(--color-text-muted)', textDecoration: 'none',
            }}>
              Sessions
            </Link>
            <Link href="/admin/prompt" style={{
              fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.15em',
              textTransform: 'uppercase', color: 'var(--color-text-muted)', textDecoration: 'none',
            }}>
              Prompt
            </Link>
          </nav>
        </div>
        <UserButton />
      </header>

      <main style={{ padding: 'clamp(32px, 5vw, 64px) clamp(24px, 5vw, 48px)' }}>
        {children}
      </main>
    </div>
  )
}
