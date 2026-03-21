import { useState, useEffect } from 'react'

const LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Work', href: '#work' },
  { label: 'Session', href: '#session' },
  { label: 'Chat', href: '#chat' },
]

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: '60px',
        background: scrolled || open ? 'rgba(249,248,245,0.96)' : 'transparent',
        backdropFilter: scrolled || open ? 'blur(12px)' : 'none',
        borderBottom: scrolled || open ? '1px solid rgba(26,25,23,0.08)' : 'none',
        transition: 'all 0.3s ease',
      }}>
        <a href="#hero" style={{
          fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 400,
          letterSpacing: '0.02em', color: 'var(--color-text-primary)', textDecoration: 'none',
        }}>
          Natural Resource
        </a>

        {/* Desktop links */}
        <div style={{ display: 'flex', gap: '32px' }} className="nr-desktop-links">
          {LINKS.map(({ label, href }) => (
            <a key={label} href={href} style={{
              fontFamily: 'var(--font-mono)', fontSize: '11px',
              letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'var(--color-text-muted)', textDecoration: 'none',
            }}>
              {label}
            </a>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(!open)} className="nr-mobile-menu-btn" style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: '8px',
          display: 'none', flexDirection: 'column', gap: '5px',
        }}>
          <span style={{ display: 'block', width: '22px', height: '1px', background: 'var(--color-text-primary)', transition: 'all 0.2s', transform: open ? 'rotate(45deg) translate(4px, 4px)' : 'none' }} />
          <span style={{ display: 'block', width: '22px', height: '1px', background: 'var(--color-text-primary)', transition: 'all 0.2s', opacity: open ? 0 : 1 }} />
          <span style={{ display: 'block', width: '22px', height: '1px', background: 'var(--color-text-primary)', transition: 'all 0.2s', transform: open ? 'rotate(-45deg) translate(4px, -4px)' : 'none' }} />
        </button>
      </nav>

      {/* Mobile dropdown */}
      {open && (
        <div style={{
          position: 'fixed', top: '60px', left: 0, right: 0, zIndex: 49,
          background: 'rgba(249,248,245,0.98)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(26,25,23,0.08)',
          display: 'flex', flexDirection: 'column',
          padding: '16px 24px 24px',
          gap: '0',
        }}>
          {LINKS.map(({ label, href }) => (
            <a key={label} href={href} onClick={() => setOpen(false)} style={{
              fontFamily: 'var(--font-mono)', fontSize: '12px',
              letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'var(--color-text-primary)', textDecoration: 'none',
              padding: '16px 0',
              borderBottom: '1px solid rgba(26,25,23,0.06)',
            }}>
              {label}
            </a>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nr-desktop-links { display: none !important; }
          .nr-mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  )
}
