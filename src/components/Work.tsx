export function Work() {
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
          <p
            className="text-base leading-relaxed text-gray-600 max-w-md"
            style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300 }}
          >
            Structured thinking work, not just conversations. A clear process to get you unstuck and moving forward.
          </p>

          {/* List */}
          <ul className="space-y-4 pt-4">
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
          <p
            className="text-base leading-relaxed text-gray-600 max-w-md"
            style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300 }}
          >
            For organizations that need to move faster without breaking what they're building.
          </p>

          {/* List */}
          <ul className="space-y-4 pt-4">
            {[
              'Systems breaking under growth',
              'Forecasts you don\'t trust',
              'AI plans that aren\'t operational',
              'A critical project off track',
              'A leadership gap slowing execution',
              'Conversion drops nobody can explain',
              'Friction between product, sales, and customers',
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
        </div>
      </div>
    </section>
  );
}
