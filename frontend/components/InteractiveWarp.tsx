'use client'
import { useEffect, useRef } from 'react'

interface Star {
  x: number; y: number; z: number
  px: number; py: number
}

export default function InteractiveWarp() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const scrollSpeedRef = useRef(1)
  const lastScrollY = useRef(0)
  const mouseRef = useRef({ x: 0, y: 0 })
  const targetMouseRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Init 3D star field
    const COUNT = 180
    starsRef.current = Array.from({ length: COUNT }, () => ({
      x: (Math.random() - 0.5) * window.innerWidth * 2,
      y: (Math.random() - 0.5) * window.innerHeight * 2,
      z: Math.random() * window.innerWidth,
      px: 0,
      py: 0,
    }))

    const onMouseMove = (e: MouseEvent) => {
      // Normalize to -0.5 to 0.5
      targetMouseRef.current = {
        x: (e.clientX / window.innerWidth) - 0.5,
        y: (e.clientY / window.innerHeight) - 0.5,
      }
    }
    window.addEventListener('mousemove', onMouseMove)

    const onScroll = () => {
      const y = window.scrollY
      const diff = Math.abs(y - lastScrollY.current)
      // Boost speed on scroll
      scrollSpeedRef.current = Math.min(25, scrollSpeedRef.current + diff * 0.15)
      lastScrollY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    const draw = () => {
      const W = canvas.width, H = canvas.height
      const cx = W / 2, cy = H / 2

      ctx.fillStyle = 'rgba(6, 0, 15, 0.25)' // trails
      ctx.fillRect(0, 0, W, H)

      // Decay scroll speed boost back to normal
      scrollSpeedRef.current += (1 - scrollSpeedRef.current) * 0.08

      // Interpolate mouse movement
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.08
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.08

      const stars = starsRef.current
      const currentSpeed = scrollSpeedRef.current

      for (const s of stars) {
        // Move closer (decrease Z)
        s.z -= currentSpeed

        // Reset if star moves past camera
        if (s.z <= 0) {
          s.z = W
          s.x = (Math.random() - 0.5) * W * 2
          s.y = (Math.random() - 0.5) * H * 2
          s.px = 0
          s.py = 0
        }

        // Project 3D coordinates to 2D
        const k = 128 / s.z
        const px = s.x * k + cx
        const py = s.y * k + cy

        // Apply mouse warp/tilt offset
        const mouseOffsetOffsetX = mouseRef.current.x * (W - s.z) * 0.12
        const mouseOffsetOffsetY = mouseRef.current.y * (H - s.z) * 0.12

        const fx = px + mouseOffsetOffsetX
        const fy = py + mouseOffsetOffsetY

        // Draw line from previous position to new position
        if (s.px !== 0 && s.py !== 0) {
          const speedFactor = Math.min(1, currentSpeed / 10)
          ctx.beginPath()
          ctx.moveTo(fx, fy)
          ctx.lineTo(s.px, s.py)
          ctx.strokeStyle = `hsla(72, 100%, 50%, ${0.1 + speedFactor * 0.5})`
          ctx.lineWidth = 1 + speedFactor * 1.5
          ctx.stroke()
        }

        s.px = fx
        s.py = fy
      }

      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('scroll', onScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}
