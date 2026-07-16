'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function ScrollAssembleCards({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const cards = el.children
    if (cards.length === 0) return

    const ctx = gsap.context(() => {
      Array.from(cards).forEach((card, index) => {
        // Assemble on enter
        gsap.fromTo(
          card,
          {
            opacity: 0,
            scale: 0.75,
            y: 120,
            rotation: index % 2 === 0 ? -6 : 6,
          },
          {
            scrollTrigger: {
              trigger: card,
              start: 'top 92%',
              end: 'top 62%',
              scrub: true,
            },
            opacity: 1,
            scale: 1,
            y: 0,
            rotation: 0,
            ease: 'power2.out',
          }
        )

        // Scatter/Disperse on exit (scroll past)
        gsap.to(card, {
          scrollTrigger: {
            trigger: card,
            start: 'bottom 35%',
            end: 'bottom top',
            scrub: true,
          },
          opacity: 0,
          scale: 0.8,
          y: -120,
          rotation: index % 2 === 0 ? 6 : -6,
          ease: 'power2.in',
        })
      })
    }, el)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {children}
    </div>
  )
}
