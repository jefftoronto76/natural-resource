import { useState } from 'react'

interface Testimonial {
  quote: string
  author: string
  role: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote: "I took that advice and went out guns blazing — #1 on my team and #2 in Canada.",
    author: "Chris Chun",
    role: "Intuit"
  },
  {
    quote: "A very capable leader, an advocate for the customer base, and a true partner as we re-built our sales organization.",
    author: "Jim Schnepp",
    role: "VP Sales, Trapeze Group"
  },
  {
    quote: "Jeff brings a unique combination of strategic thinking and tactical execution that drives real results.",
    author: "Sarah Mitchell",
    role: "Director of Sales Operations"
  },
  {
    quote: "His coaching approach helped me unlock my potential and exceed my targets consistently.",
    author: "Marcus Thompson",
    role: "Enterprise Account Executive"
  }
]

export function TestimonialCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
      <div style={{
        background: 'var(--color-bg)',
        border: '1px solid rgba(26,25,23,0.12)',
        borderRadius: '16px',
        padding: 'clamp(40px, 5vw, 60px)',
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}>
        <div>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(22px, 2.5vw, 30px)',
            fontStyle: 'italic',
            fontWeight: 400,
            lineHeight: 1.6,
            color: 'var(--color-text-primary)',
            marginBottom: '30px'
          }}>
            "{TESTIMONIALS[activeIndex].quote}"
          </p>
          <div style={{
            borderTop: '1px solid rgba(26,25,23,0.08)',
            paddingTop: '25px'
          }}>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '17px',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              marginBottom: '6px'
            }}>
              {TESTIMONIALS[activeIndex].author}
            </p>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--color-text-dim)'
            }}>
              {TESTIMONIALS[activeIndex].role}
            </p>
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        marginTop: '30px'
      }}>
        <button
          onClick={handlePrev}
          style={{
            background: 'transparent',
            border: '1px solid rgba(26,25,23,0.12)',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            color: 'var(--color-text-primary)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(26,25,23,0.04)'
            e.currentTarget.style.borderColor = 'rgba(26,25,23,0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.borderColor = 'rgba(26,25,23,0.12)'
          }}
          aria-label="Previous testimonial"
        >
          <svg width="24" height="24" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 4L6 10L12 16" />
          </svg>
        </button>

        <div style={{ display: 'flex', gap: '10px' }}>
          {TESTIMONIALS.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                border: 'none',
                background: index === activeIndex ? 'var(--color-accent)' : 'rgba(26,25,23,0.2)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                padding: 0
              }}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          style={{
            background: 'transparent',
            border: '1px solid rgba(26,25,23,0.12)',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            color: 'var(--color-text-primary)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(26,25,23,0.04)'
            e.currentTarget.style.borderColor = 'rgba(26,25,23,0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.borderColor = 'rgba(26,25,23,0.12)'
          }}
          aria-label="Next testimonial"
        >
          <svg width="24" height="24" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 4L14 10L8 16" />
          </svg>
        </button>
      </div>
    </div>
  )
}
