// pages/boardseat.tsx  (or app/boardseat/page.tsx for App Router)
// Drop this into your Next.js repo at the appropriate route path.
// Replace VIDEO_URL placeholder when YouTube upload is complete.

export default function BoardseatPage() {
  const VIDEO_URL = "https://www.youtube.com/embed/YOUR_VIDEO_ID_HERE"; // ← swap in after upload
  const TALLY_URL = "https://tally.so/r/q4oKr8";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #f9f8f5;
          color: #1a1917;
          font-family: 'DM Sans', sans-serif;
          font-size: 16px;
          -webkit-font-smoothing: antialiased;
        }

        .page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* ── NAV ── */
        .nav {
          padding: 20px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(26,25,23,0.08);
        }
        .nav-wordmark {
          font-family: 'Playfair Display', serif;
          font-size: 15px;
          font-weight: 400;
          color: #1a1917;
          letter-spacing: 0.01em;
        }
        .nav-badge {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: rgba(26,25,23,0.55);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        /* ── HERO ── */
        .hero {
          padding: 48px 24px 40px;
          text-align: center;
          max-width: 680px;
          margin: 0 auto;
          width: 100%;
        }
        .hero-label {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(26,25,23,0.45);
          margin-bottom: 16px;
        }
        .hero-headline {
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 6vw, 42px);
          font-weight: 500;
          line-height: 1.2;
          color: #1a1917;
          margin-bottom: 12px;
        }
        .hero-headline .accent {
          position: relative;
          display: inline-block;
          color: #2d6a4f;
        }
        .hero-sub {
          font-size: 17px;
          color: rgba(26,25,23,0.65);
          line-height: 1.6;
          font-weight: 300;
          margin-bottom: 0;
        }

        /* ── VIDEO ── */
        .video-section {
          padding: 0 24px 40px;
          max-width: 760px;
          margin: 0 auto;
          width: 100%;
        }
        .video-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          border-radius: 12px;
          overflow: hidden;
          background: #1a1917;
          box-shadow: 0 4px 32px rgba(26,25,23,0.12);
        }
        .video-wrap iframe {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border: none;
        }
        .video-placeholder {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: rgba(249,248,245,0.5);
        }
        .video-placeholder svg {
          opacity: 0.4;
        }
        .video-placeholder p {
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          letter-spacing: 0.04em;
        }

        /* ── SURVEY CTA ── */
        .cta-section {
          padding: 0 24px 56px;
          max-width: 680px;
          margin: 0 auto;
          width: 100%;
          text-align: center;
        }
        .cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #2d6a4f;
          color: #f9f8f5;
          font-family: 'DM Sans', sans-serif;
          font-size: 16px;
          font-weight: 500;
          padding: 16px 32px;
          border-radius: 8px;
          text-decoration: none;
          transition: background 0.2s ease, transform 0.15s ease;
          border: none;
          cursor: pointer;
          width: 100%;
          max-width: 360px;
          justify-content: center;
        }
        .cta-btn:hover {
          background: #235440;
          transform: translateY(-1px);
        }
        .cta-btn:active {
          transform: translateY(0);
        }
        .cta-sub {
          margin-top: 12px;
          font-size: 14px;
          color: rgba(26,25,23,0.45);
          font-family: 'DM Mono', monospace;
          letter-spacing: 0.02em;
        }

        /* ── WHY JEFF ── */
        .why-section {
          padding: 48px 24px;
          background: #fff;
          border-top: 1px solid rgba(26,25,23,0.07);
          border-bottom: 1px solid rgba(26,25,23,0.07);
        }
        .why-inner {
          max-width: 680px;
          margin: 0 auto;
        }
        .why-label {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(26,25,23,0.45);
          margin-bottom: 24px;
          text-align: center;
        }
        .why-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 24px;
        }
        .why-card {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .why-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: rgba(45,106,79,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
        }
        .why-icon svg {
          color: #2d6a4f;
        }
        .why-title {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          font-weight: 500;
          color: #1a1917;
        }
        .why-body {
          font-size: 15px;
          color: rgba(26,25,23,0.65);
          line-height: 1.6;
          font-weight: 300;
        }

        /* ── FOOTER ── */
        .footer {
          margin-top: auto;
          padding: 32px 24px;
          text-align: center;
          border-top: 1px solid rgba(26,25,23,0.07);
        }
        .footer-sign {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 400;
          color: #1a1917;
          margin-bottom: 6px;
        }
        .footer-meta {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: rgba(26,25,23,0.4);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        @media (max-width: 480px) {
          .nav { padding: 16px 20px; }
          .hero { padding: 36px 20px 32px; }
          .video-section { padding: 0 20px 32px; }
          .cta-section { padding: 0 20px 48px; }
          .why-section { padding: 40px 20px; }
          .why-grid { grid-template-columns: 1fr; gap: 28px; }
          .footer { padding: 28px 20px; }
        }
      `}</style>

      <div className="page">

        {/* NAV */}
        <nav className="nav">
          <span className="nav-wordmark">Jeff Lougheed</span>
          <span className="nav-badge">10-Year Resident · Noble Lofts</span>
        </nav>

        {/* HERO */}
        <section className="hero">
          <p className="hero-label">Noble Lofts · 24 Noble St · Board Election</p>
          <h1 className="hero-headline">
            Better communication<br />
            for <span className="accent">our building.</span>
          </h1>
          <p className="hero-sub">
            I'm running for the Board because I know this building, its history,
            and what it takes to get things done.
          </p>
        </section>

        {/* VIDEO */}
        <section className="video-section">
          <div className="video-wrap">
            {VIDEO_URL.includes("YOUR_VIDEO_ID") ? (
              <div className="video-placeholder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <polygon points="10,8 16,12 10,16" fill="currentColor" stroke="none"/>
                </svg>
                <p>Video coming soon</p>
              </div>
            ) : (
              <iframe
                src={VIDEO_URL}
                title="Jeff Lougheed — Noble Lofts Board Candidate"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <a href={TALLY_URL} target="_blank" rel="noopener noreferrer" className="cta-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Share your concerns — 2-min survey
          </a>
          <p className="cta-sub">Anonymous · Takes 2 minutes</p>
        </section>

        {/* WHY JEFF */}
        <section className="why-section">
          <div className="why-inner">
            <p className="why-label">Why Jeff?</p>
            <div className="why-grid">

              <div className="why-card">
                <div className="why-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2d6a4f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </div>
                <p className="why-title">Experienced</p>
                <p className="why-body">10 years in the building. I know the window project, the bike storage situation, and how decisions have been made — or not made.</p>
              </div>

              <div className="why-card">
                <div className="why-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2d6a4f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <p className="why-title">Accountable</p>
                <p className="why-body">I'll keep the Board, management, and residents on the same page. No more information gaps. No more wondering what's happening.</p>
              </div>

              <div className="why-card">
                <div className="why-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2d6a4f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="13 2 13 9 20 9"/>
                    <path d="M21 3L13 11"/>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  </svg>
                </div>
                <p className="why-title">Action-Oriented</p>
                <p className="why-body">Windows, bike storage, fee transparency. Three things I'll push on from day one. Not promises — a short list I intend to keep.</p>
              </div>

            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="footer">
          <p className="footer-sign">See you on Thursday. – Jeff</p>
          <p className="footer-meta">Noble Lofts · 24 Noble St · Toronto</p>
        </footer>

      </div>
    </>
  );
}
