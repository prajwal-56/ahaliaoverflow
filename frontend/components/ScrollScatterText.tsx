'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function ScrollScatterText({
  text,
  className,
  triggerSelector,
}: {
  text: string
  className?: string
  triggerSelector: string
}) {
  const containerRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const chars = el.querySelectorAll('.scatter-char')
    if (chars.length === 0) return

    // GSAP ScrollTrigger animation
    const ctx = gsap.context(() => {
      gsap.to(chars, {
        scrollTrigger: {
          trigger: triggerSelector,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
        x: () => (Math.random() - 0.5) * window.innerWidth * 0.5,
        y: () => -(Math.random() * 300 + 100),
        rotation: () => (Math.random() - 0.5) * 360,
        opacity: 0,
        scale: 0.3,
        ease: 'power1.out',
      })
    }, el)

    return () => ctx.revert()
  }, [triggerSelector])

  return (
    <span ref={containerRef} className={className}>
      {text.split('').map((char, i) => {
        if (char === ' ') return <span key={i} className="inline-block">&nbsp;</span>
        return (
          <span
            key={i}
            className="scatter-char inline-block origin-center will-change-transform"
          >
            {char}
          </span>
        )
      })}
    </span>
  )
}
