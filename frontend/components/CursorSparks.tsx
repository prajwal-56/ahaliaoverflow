'use client'
import { useEffect, useRef } from 'react'

interface Spark {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  alpha: number
  decay: number
}

export default function CursorSparks() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sparksRef = useRef<Spark[]>([])
  const isMouseDownRef = useRef(false)
  const lastMousePosRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number>()

  useEffect(() => {
    // Only on desktop pointing devices
    if (window.matchMedia('(pointer: coarse)').matches) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const colors = ['#C8FF00', '#FF2D78', '#00E5FF', '#FFFFFF']

    const createSparks = (x: number, y: number, count: number) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = Math.random() * 6 + 2
        sparksRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1, // slight gravity upward initially
          size: Math.random() * 2.5 + 1.2,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          decay: Math.random() * 0.03 + 0.015,
        })
      }
    }

    const onMouseMove = (e: MouseEvent) => {
      const x = e.clientX
      const y = e.clientY
      
      // If clicking & dragging, spawn heavy sparks
      if (isMouseDownRef.current) {
        createSparks(x, y, 6)
      } else {
        // Light trail even when not clicking
        if (Math.random() < 0.15) {
          createSparks(x, y, 1)
        }
      }
      
      lastMousePosRef.current = { x, y }
    }

    const onMouseDown = (e: MouseEvent) => {
      isMouseDownRef.current = true
      createSparks(e.clientX, e.clientY, 15) // burst on click
    }

    const onMouseUp = () => {
      isMouseDownRef.current = false
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const sparks = sparksRef.current
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i]
        
        // Update physics
        s.x += s.vx
        s.y += s.vy
        s.vy += 0.15 // Gravity pull down
        s.alpha -= s.decay

        if (s.alpha <= 0) {
          sparks.splice(i, 1)
          continue
        }

        // Draw spark line (stretch based on velocity)
        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(s.x - s.vx * 1.5, s.y - s.vy * 1.5)
        ctx.strokeStyle = s.color
        ctx.globalAlpha = s.alpha
        ctx.lineWidth = s.size
        ctx.lineCap = 'round'
        
        // Spark glow
        ctx.shadowBlur = 8
        ctx.shadowColor = s.color
        
        ctx.stroke()
      }
      
      // Reset shadow blur
      ctx.shadowBlur = 0
      ctx.globalAlpha = 1

      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[9999] pointer-events-none"
      style={{ background: 'transparent' }}
    />
  )
}
