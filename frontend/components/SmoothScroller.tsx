'use client'
import { useEffect, useRef } from 'react'

export default function SmoothScroller({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<any>(null)

  useEffect(() => {
    // Dynamically import Lenis to avoid SSR issues
    import('lenis').then(({ default: Lenis }) => {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      })
      lenisRef.current = lenis

      function raf(time: number) {
        lenis.raf(time)
        requestAnimationFrame(raf)
      }
      requestAnimationFrame(raf)
    })

    return () => {
      lenisRef.current?.destroy()
    }
  }, [])

  return <>{children}</>
}
