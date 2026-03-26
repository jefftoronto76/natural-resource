import { useState } from 'react';

export function Work() {
  const [expandedCard1, setExpandedCard1] = useState(false);
  const [expandedCard2, setExpandedCard2] = useState(false);

  return (
    <section id="work" className="w-full px-8 py-32 max-w-7xl mx-auto">
      {/* Headline */}
      <div className="mb-24">
        <h2
          className="text-6xl leading-tight max-w-2xl mb-6"
          style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}
        >
          One operator.
          <br />
          <span className="italic">Two ways in.</span>
        </h2>
        <p
          className="text-lg leading-relaxed"
          style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 400, color: 'rgba(26,25,23,0.6)' }}
        >
          I studied coaching at the graduate level, and it's embedded in how I approach growth and leadership.
        </p>
      </div>

      {/* Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
        {/* Column 1 - 1-on-1 Coaching */}
        <div className="space-y-8 border rounded-lg p-8" style={{ borderColor: 'rgba(26,25,23,0.12)' }}>
          {/* Number */}
          <div
            className="text-xs tracking-widest text-gray-300"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            01
          </div>

          {/* Category */}
          <div
            className="text-xs tracking-widest text-gray-400 uppercase"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            FOR AMBITIOUS PROFESSIONALS
          </div>

          {/* Service Title */}
          <h3
            className="text-4xl"
            style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}
          >
            1-on-1 Coaching
          </h3>

          {/* Description */}
          <div className="max-w-md space-y-2">
            <p
              className="text-base leading-relaxed text-gray-600"
              style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300 }}
            >
              Structured thinking work, not just conversations.
            </p>
            <p
              className="text-base leading-relaxed text-gray-600"
              style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300 }}
            >
              A clear process to get you unstuck and moving forward.
            </p>
          </div>

          {/* List */}
          <div className="work-card-list-wrapper">
            <ul className="space-y-4 pt-4 work-card-list" style={{
              maxHeight: expandedCard1 ? '1000px' : '0',
              overflow: 'hidden',
              transition: 'max-height 0.3s ease'
            }}>
              {[
                'A deal you can\'t afford to lose',
                'Conversations you don\'t know how to have',
                'Teams that aren\'t working together',
                'Decisions with no clear answer',
                'A project that\'s going sideways',
                'Pipeline that doesn\'t convert',
                'Customers quietly churning',
              ].map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-lg text-gray-500"
                  style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300 }}
                >
                  <span className="text-gray-300 mt-1">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setExpandedCard1(!expandedCard1)}
              className="work-card-toggle"
              style={{
                marginTop: '16px',
                background: 'transparent',
                border: 'none',
                color: '#2d6a4f',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'none',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 0',
              }}
            >
              {expandedCard1 ? 'See less' : 'See more'}
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transform: expandedCard1 ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease'
                }}
              >
                <path d="M4 6L8 10L12 6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Column 2 - Embedded Execution */}
        <div className="space-y-8 border rounded-lg p-8" style={{ borderColor: 'rgba(26,25,23,0.12)' }}>
          {/* Number */}
          <div
            className="text-xs tracking-widest text-gray-300"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            02
          </div>

          {/* Category */}
          <div
            className="text-xs tracking-widest text-gray-400 uppercase"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            FOR FOUNDERS, CEOS, AND PE LEADERS
          </div>

          {/* Service Title */}
          <h3
            className="text-4xl"
            style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}
          >
            Embedded Execution
          </h3>

          {/* Description */}
          <div className="max-w-md space-y-2">
            <p
              className="text-base leading-relaxed text-gray-600"
              style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300 }}
            >
              For organizations that want to grow without the drama.
            </p>
            <p
              className="text-base leading-relaxed text-gray-600"
              style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300 }}
            >
              I build systems that stop problems from happening.
            </p>
          </div>

          {/* List */}
          <div className="work-card-list-wrapper">
            <ul className="space-y-4 pt-4 work-card-list" style={{
              maxHeight: expandedCard2 ? '1000px' : '0',
              overflow: 'hidden',
              transition: 'max-height 0.3s ease'
            }}>
              {[
                'Forecasts you don\'t trust',
                'Conversion drops nobody can explain',
                'Systems breaking under growth',
                'A critical project off track',
                'A leadership gap slowing execution',
                'Friction between product, sales, and customers',
                'AI plans that aren\'t operational',
              ].map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-lg text-gray-500"
                  style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300 }}
                >
                  <span className="text-gray-300 mt-1">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setExpandedCard2(!expandedCard2)}
              className="work-card-toggle"
              style={{
                marginTop: '16px',
                background: 'transparent',
                border: 'none',
                color: '#2d6a4f',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'none',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 0',
              }}
            >
              {expandedCard2 ? 'See less' : 'See more'}
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transform: expandedCard2 ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease'
                }}
              >
                <path d="M4 6L8 10L12 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 769px) {
          .work-card-list {
            max-height: none !important;
          }
        }
        @media (max-width: 768px) {
          .work-card-toggle {
            display: flex !important;
          }
        }
      `}</style>
    </section>
  );
}
