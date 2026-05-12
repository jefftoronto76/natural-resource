export default function BoardseatPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f9f8f5; color: #1a1917; font-family: 'DM Sans', sans-serif; font-size: 16px; -webkit-font-smoothing: antialiased; }
        .page { min-height: 100vh; display: flex; flex-direction: column; }
        .nav { position: relative; padding: 20px 24px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(26,25,23,0.08); gap: 16px; }
        .nav-links { display: flex; align-items: center; gap: 14px; }
        .nav-link { display: inline-flex; align-items: center; gap: 6px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: rgba(26,25,23,0.65); text-decoration: none; transition: color 0.15s ease; }
        .nav-link:hover { color: #2d6a4f; }
        .nav-link img { width: 16px; height: 16px; display: block; }
        .nav-wordmark { font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 400; color: #1a1917; letter-spacing: 0.01em; }
        .nav-badge { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); font-family: 'DM Mono', monospace; font-size: 11px; color: rgba(26,25,23,0.55); letter-spacing: 0.04em; text-transform: uppercase; white-space: nowrap; pointer-events: none; }
        .hero { padding: 48px 24px 40px; text-align: center; max-width: 680px; margin: 0 auto; width: 100%; }
        .hero-label { font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(26,25,23,0.45); margin-bottom: 16px; }
        .hero-headline { font-family: 'Playfair Display', serif; font-size: clamp(28px, 6vw, 42px); font-weight: 500; line-height: 1.2; color: #1a1917; margin-bottom: 12px; }
        .hero-headline .accent { color: #2d6a4f; }
        .hero-sub { font-size: 17px; color: rgba(26,25,23,0.65); line-height: 1.6; font-weight: 300; }
        .video-section { padding: 0 24px 32px; max-width: 760px; margin: 0 auto; width: 100%; }
        .video-wrap { position: relative; width: 100%; aspect-ratio: 16/9; border-radius: 12px; overflow: hidden; background: #1a1917; box-shadow: 0 4px 32px rgba(26,25,23,0.12); }
        .video-wrap iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: none; }
        .photo-section { padding: 0 24px 32px; max-width: 560px; margin: 0 auto; width: 100%; }
        .photo-wrap { border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(26,25,23,0.10); }
        .photo-wrap img { width: 100%; height: auto; display: block; }
        .cta-section { padding: 0 24px 56px; max-width: 680px; margin: 0 auto; width: 100%; text-align: center; }
        .cta-btn { display: inline-flex; align-items: center; gap: 10px; background: #2d6a4f; color: #f9f8f5; font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 500; padding: 16px 32px; border-radius: 8px; text-decoration: none; transition: background 0.2s ease, transform 0.15s ease; width: 100%; max-width: 360px; justify-content: center; }
        .cta-btn:hover { background: #235440; transform: translateY(-1px); }
        .cta-btn:active { transform: translateY(0); }
        .cta-sub { margin-top: 12px; font-size: 14px; color: rgba(26,25,23,0.45); font-family: 'DM Mono', monospace; letter-spacing: 0.02em; }
        .why-section { padding: 48px 24px 56px; background: #fff; border-top: 1px solid rgba(26,25,23,0.07); }
        .why-inner { max-width: 680px; margin: 0 auto; }
        .section-label { font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(26,25,23,0.45); margin-bottom: 32px; text-align: center; }
        .why-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 32px; }
        .why-card { display: flex; flex-direction: column; gap: 8px; }
        .why-icon { width: 36px; height: 36px; border-radius: 8px; background: rgba(45,106,79,0.1); display: flex; align-items: center; justify-content: center; margin-bottom: 4px; }
        .why-title { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 500; color: #1a1917; }
        .why-body { font-size: 15px; color: rgba(26,25,23,0.65); line-height: 1.6; font-weight: 300; }
        .footer { margin-top: auto; padding: 32px 24px; text-align: center; border-top: 1px solid rgba(26,25,23,0.07); }
        .footer-sign { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 400; color: #1a1917; margin-bottom: 6px; }
        .footer-meta { font-family: 'DM Mono', monospace; font-size: 11px; color: rgba(26,25,23,0.4); letter-spacing: 0.04em; text-transform: uppercase; }
        @media (max-width: 480px) {
          .nav { padding: 16px 20px; }
          .nav-badge { display: none; }
          .nav-wordmark { display: none; }
          .nav-link span { display: none; }
          .nav-links { gap: 16px; }
          .hero { padding: 36px 20px 32px; }
          .video-section, .photo-section, .cta-section { padding-left: 20px; padding-right: 20px; }
          .why-section { padding: 40px 20px 48px; }
          .why-grid { grid-template-columns: 1fr; gap: 28px; }
          .footer { padding: 28px 20px; }
        }
      `}</style>

      <div className="page">

        <nav className="nav">
          <span className="nav-wordmark">Jeff Lougheed</span>
          <span className="nav-badge">10+ Year Resident · Noble Lofts</span>
          <div className="nav-links">
            <a href="https://jefflougheed.ca" target="_blank" rel="noopener noreferrer" className="nav-link" aria-label="Jeff Lougheed website">
              <img src="/world-wide-web.svg" alt="" />
              <span>jefflougheed.ca</span>
            </a>
            <a href="https://www.linkedin.com/in/lougheedjeff/" target="_blank" rel="noopener noreferrer" className="nav-link" aria-label="Jeff Lougheed on LinkedIn">
              <img src="/linkedin.svg" alt="" />
              <span>LinkedIn</span>
            </a>
          </div>
        </nav>

        <section className="hero">
          <h1 className="hero-headline">
            Better communication<br />
            for <span className="accent">our building.</span>
          </h1>
          <p className="hero-sub">
            I'm running for the Board because I know this building, its history,
            and what it takes to get things done.
          </p>
        </section>

        <section className="video-section">
          <div className="video-wrap">
            <iframe
              src="https://www.youtube.com/embed/7EfZ_R-dPLU"
              title="Jeff Lougheed — Noble Lofts Board Candidate"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>

        <section className="photo-section">
          <div className="photo-wrap">
            <img src="/jeff-noble.jpg" alt="Jeff Lougheed at home with his family" />
          </div>
        </section>

        <section className="cta-section">
          <a href="https://tally.so/r/q4oKr8" target="_blank" rel="noopener noreferrer" className="cta-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Share your concerns — 2-min survey
          </a>
          <p className="cta-sub">Anonymous · Takes 2 minutes</p>
        </section>

        <section className="why-section">
          <div className="why-inner">
            <p className="section-label">Why Jeff?</p>
            <div className="why-grid">

              <div className="why-card">
                <div className="why-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2d6a4f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </div>
                <p className="why-title">Experienced</p>
                <p className="why-body">15+ years in the building. I kick-started the garden committee back in 2012. I'm also a founder, operator, and executive coach. I know what better looks like.</p>
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
                <p className="why-body">We'll define what good board leadership looks like and implement it. Clear communication, transparent decisions, and no information gaps between the Board, management, and residents.</p>
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
                <p className="why-body">I'm already getting things done around the building and in the community. On the board, it'll be easier for me to communicate with all of you and make sure things actually move.</p>
              </div>

            </div>
          </div>
        </section>

        <footer className="footer">
          <p className="footer-sign">See you on Thursday. – Jeff</p>
          <p className="footer-meta">Noble Lofts · 24 Noble St · Toronto</p>
        </footer>

      </div>
    </>
  );
}
