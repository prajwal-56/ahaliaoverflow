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
        // Use a single timeline to prevent conflicts over the same CSS properties
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: 'top 95%',
            end: 'bottom 10%',
            scrub: true,
          },
        })

        // Step 1: Fly-in entry
        tl.fromTo(
          card,
          {
            opacity: 0,
            scale: 0.5,
            y: 220,
            z: -300,
            rotationX: 45,
            rotationY: index % 2 === 0 ? -15 : 15,
            rotationZ: index % 2 === 0 ? -8 : 8,
          },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            z: 0,
            rotationX: 0,
            rotationY: 0,
            rotationZ: 0,
            duration: 0.3,
            ease: 'power2.out',
          }
        )
        // Step 2: Settle / Hold normal state in middle
        .to(card, {
          duration: 0.4,
        })
        // Step 3: Disperse entry
        .to(card, {
          opacity: 0,
          scale: 0.5,
          y: -220,
          z: 300,
          rotationX: -45,
          rotationY: index % 2 === 0 ? 15 : -15,
          rotationZ: index % 2 === 0 ? 8 : -8,
          duration: 0.3,
          ease: 'power2.in',
        })
      })
    }, el)

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={containerRef}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
      style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  )
}
