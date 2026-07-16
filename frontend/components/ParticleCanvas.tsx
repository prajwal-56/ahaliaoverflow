'use client'
import { useEffect, useRef } from 'react'

interface Particle {
  x: number; y: number
  vx: number; vy: number
  r: number; alpha: number
}

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const particlesRef = useRef<Particle[]>([])
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

    // Init particles
    const COUNT = Math.min(120, Math.floor((window.innerWidth * window.innerHeight) / 12000))
    particlesRef.current = Array.from({ length: COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 1.8 + 0.6,
      alpha: Math.random() * 0.6 + 0.2,
    }))

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    const onMouseLeave = () => { mouseRef.current = { x: -9999, y: -9999 } }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseleave', onMouseLeave)

    const CONNECT_DIST = 140
    const REPEL_DIST = 120
    const REPEL_FORCE = 3.5

    const draw = () => {
      const W = canvas.width, H = canvas.height
      ctx.clearRect(0, 0, W, H)

      const { x: mx, y: my } = mouseRef.current
      const particles = particlesRef.current

      // Update positions
      for (const p of particles) {
        // Repel from mouse
        const dx = p.x - mx
        const dy = p.y - my
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d < REPEL_DIST && d > 0) {
          const force = (REPEL_DIST - d) / REPEL_DIST * REPEL_FORCE
          p.vx += (dx / d) * force * 0.04
          p.vy += (dy / d) * force * 0.04
        }

        // Friction
        p.vx *= 0.98
        p.vy *= 0.98

        p.x += p.vx
        p.y += p.vy

        // Wrap edges
        if (p.x < 0) p.x = W
        if (p.x > W) p.x = 0
        if (p.y < 0) p.y = H
        if (p.y > H) p.y = 0
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i]
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < CONNECT_DIST) {
            const alpha = (1 - dist / CONNECT_DIST) * 0.35
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(200, 255, 0, ${alpha})`
            ctx.lineWidth = 0.6
            ctx.stroke()
          }
        }
      }

      // Mouse glow circle
      if (mx > 0) {
        const grad = ctx.createRadialGradient(mx, my, 0, mx, my, REPEL_DIST)
        grad.addColorStop(0, 'rgba(200,255,0,0.06)')
        grad.addColorStop(1, 'rgba(200,255,0,0)')
        ctx.beginPath()
        ctx.arc(mx, my, REPEL_DIST, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
      }

      // Draw particles
      for (const p of particles) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200, 255, 0, ${p.alpha})`
        ctx.shadowBlur = 6
        ctx.shadowColor = '#C8FF00'
        ctx.fill()
        ctx.shadowBlur = 0
      }

      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseleave', onMouseLeave)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: 'transparent' }}
    />
  )
}
