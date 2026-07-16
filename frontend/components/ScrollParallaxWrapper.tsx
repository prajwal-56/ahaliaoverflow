'use client'
import { useEffect, useRef, ReactNode } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function ScrollParallaxWrapper({
  children,
  yOffset = 80,
  rotationOffset = 0,
  scaleOffset = 0,
  triggerSelector,
  className,
}: {
  children: ReactNode
  yOffset?: number
  rotationOffset?: number
  scaleOffset?: number
  triggerSelector?: string
  className?: string
}) {
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = elementRef.current
    if (!el) return

    const trigger = triggerSelector || el

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        {
          y: yOffset,
          rotation: rotationOffset,
          scale: 1 - scaleOffset,
        },
        {
          scrollTrigger: {
            trigger: trigger,
            start: 'top 95%',
            end: 'bottom 5%',
            scrub: true,
          },
          y: -yOffset,
          rotation: -rotationOffset,
          scale: 1 + scaleOffset,
          ease: 'none',
        }
      )
    }, el)

    return () => ctx.revert()
  }, [yOffset, rotationOffset, scaleOffset, triggerSelector])

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  )
}
