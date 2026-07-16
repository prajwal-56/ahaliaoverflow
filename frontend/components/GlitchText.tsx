'use client'
import { useState, useEffect, useRef } from 'react'

const CHARS = 'X█▓▒░$#@%&?⚡◈▢◆◇◣◢'

export default function GlitchText({ text, className }: { text: string; className?: string }) {
  const [display, setDisplay] = useState(text)
  const isHovered = useRef(false)
  const animationFrame = useRef<number>()

  const handleMouseEnter = () => {
    isHovered.current = true
    let iteration = 0

    const trigger = () => {
      if (!isHovered.current) return

      setDisplay(
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' '
            if (index < iteration) return text[index]
            return CHARS[Math.floor(Math.random() * CHARS.length)]
          })
          .join('')
      )

      if (iteration < text.length) {
        iteration += 1 / 3
        animationFrame.current = requestAnimationFrame(trigger)
      } else {
        setDisplay(text)
      }
    }
    trigger()
  }

  const handleMouseLeave = () => {
    isHovered.current = false
    setDisplay(text)
    if (animationFrame.current) cancelAnimationFrame(animationFrame.current)
  }

  useEffect(() => {
    return () => {
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current)
    }
  }, [])

  return (
    <span
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ display: 'inline-block' }}
    >
      {display}
    </span>
  )
}
