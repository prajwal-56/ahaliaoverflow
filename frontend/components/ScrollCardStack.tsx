'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function ScrollCardStack({ children }: { children: React.ReactNode[] }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const cards = el.querySelectorAll('.stack-card-wrapper')
    if (cards.length === 0) return

    const ctx = gsap.context(() => {
      // Animate cards on scroll to scale/rotate as they overlay
      cards.forEach((card, idx) => {
        if (idx === 0) return // first card stays flat

        gsap.fromTo(
          card,
          {
            scale: 0.88,
            rotation: idx % 2 === 0 ? -4 : 4,
            yPercent: 20,
          },
          {
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              end: 'top 30%',
              scrub: true,
            },
            scale: 1,
            rotation: idx % 2 === 0 ? -1.5 : 1.5,
            yPercent: 0,
            ease: 'none',
          }
        )
      })
    }, el)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="max-w-xl mx-auto space-y-24 relative pb-32">
      {children.map((child, idx) => (
        <div
          key={idx}
          className="stack-card-wrapper sticky top-32 w-full transition-shadow duration-300"
          style={{
            zIndex: idx + 10,
            transformStyle: 'preserve-3d',
            perspective: '800px',
          }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}

