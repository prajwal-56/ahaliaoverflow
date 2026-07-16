'use client'
import { useRef, MouseEvent, ReactNode } from 'react'

export default function MagneticButton({
  children,
  className,
  strength = 0.35,
  onClick,
  href,
}: {
  children: ReactNode
  className?: string
  strength?: number
  onClick?: () => void
  href?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  const onMove = (e: MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    el.style.transform = `translate(${x * strength}px, ${y * strength}px)`
  }

  const onLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.transform = 'translate(0px, 0px)'
    el.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
  }

  const onEnter = () => {
    const el = ref.current
    if (!el) return
    el.style.transition = 'transform 0.1s ease'
  }

  const inner = (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onMouseEnter={onEnter}
      onClick={onClick}
      className={className}
      style={{ transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)', display: 'inline-block' }}
    >
      {children}
    </div>
  )

  if (href) {
    return <a href={href} style={{ display: 'inline-block' }}>{inner}</a>
  }
  return inner
}
