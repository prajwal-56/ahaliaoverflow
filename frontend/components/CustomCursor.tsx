'use client'
import { useEffect, useRef, useState } from 'react'

export default function CustomCursor() {
  const cursorDotRef = useRef<HTMLDivElement>(null)
  const cursorRingRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const posRef = useRef({ x: 0, y: 0 })
  const ringPosRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number>()

  useEffect(() => {
    // Only on desktop
    if (window.matchMedia('(pointer: coarse)').matches) return

    const dot = cursorDotRef.current
    const ring = cursorRingRef.current
    if (!dot || !ring) return

    setIsVisible(true)

    const onMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY }
    }

    const animate = () => {
      // Dot snaps instantly
      if (dot) {
        dot.style.transform = `translate(${posRef.current.x - 4}px, ${posRef.current.y - 4}px)`
      }

      // Ring lags behind (lerp)
      ringPosRef.current.x += (posRef.current.x - ringPosRef.current.x) * 0.12
      ringPosRef.current.y += (posRef.current.y - ringPosRef.current.y) * 0.12
      if (ring) {
        ring.style.transform = `translate(${ringPosRef.current.x - 20}px, ${ringPosRef.current.y - 20}px)`
      }

      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)

    // Hover detection on interactive elements
    const onEnter = () => setIsHovering(true)
    const onLeave = () => setIsHovering(false)
    const interactives = document.querySelectorAll('a, button, [role="button"], input, select, textarea')
    interactives.forEach(el => {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
    })

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseleave', () => setIsVisible(false))
    document.addEventListener('mouseenter', () => setIsVisible(true))

    return () => {
      document.removeEventListener('mousemove', onMove)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      interactives.forEach(el => {
        el.removeEventListener('mouseenter', onEnter)
        el.removeEventListener('mouseleave', onLeave)
      })
    }
  }, [])

  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) return null

  return (
    <>
      {/* Dot */}
      <div
        ref={cursorDotRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          width: 6, height: 6, borderRadius: '50%',
          background: '#C8FF00',
          boxShadow: '0 0 8px #C8FF00, 0 0 20px rgba(200,255,0,0.5)',
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.3s',
          willChange: 'transform',
        }}
      />
      {/* Ring */}
      <div
        ref={cursorRingRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          width: 36, height: 36, borderRadius: '50%',
          border: `1px solid ${isHovering ? '#C8FF00' : 'rgba(200,255,0,0.4)'}`,
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.3s, border-color 0.2s',
          transform: isHovering ? 'scale(1.6)' : 'scale(1)',
          willChange: 'transform',
          boxShadow: isHovering ? '0 0 14px rgba(200,255,0,0.5)' : 'none',
        }}
      />
    </>
  )
}
