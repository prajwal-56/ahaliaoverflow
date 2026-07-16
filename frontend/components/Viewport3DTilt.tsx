'use client'
import { useEffect, useRef } from 'react'

export default function Viewport3DTilt({ children }: { children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Only on desktop pointer devices
    if (window.matchMedia('(pointer: coarse)').matches) return

    const handleMouseMove = (e: MouseEvent) => {
      const el = wrapperRef.current
      if (!el) return

      const w = window.innerWidth
      const h = window.innerHeight
      // Normalize coordinate: -0.5 to 0.5
      const nx = (e.clientX / w) - 0.5
      const ny = (e.clientY / h) - 0.5

      // Slight rotation (Max 1.8deg) & slide (Max 15px)
      const rotateX = ny * -1.8
      const rotateY = nx * 1.8
      const translateX = nx * 12
      const translateY = ny * 12

      el.style.transform = `perspective(2000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(${translateX}px, ${translateY}px, 0)`
    }

    const handleMouseLeave = () => {
      const el = wrapperRef.current
      if (!el) return
      el.style.transform = 'perspective(2000px) rotateX(0deg) rotateY(0deg) translate3d(0px, 0px, 0px)'
    }

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <div
      ref={wrapperRef}
      className="w-full min-h-screen"
      style={{
        transition: 'transform 0.4s cubic-bezier(0.1, 1, 0.2, 1)',
        transformStyle: 'preserve-3d',
      }}
    >
      {children}
    </div>
  )
}
