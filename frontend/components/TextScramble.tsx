'use client'
import { useEffect, useRef, useState } from 'react'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*'

export default function TextScramble({
  text,
  className,
  delay = 0,
}: {
  text: string
  className?: string
  delay?: number
}) {
  const [display, setDisplay] = useState(text.replace(/[^\s]/g, ' '))
  const frameRef = useRef<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      let frame = 0
      const totalFrames = text.length * 5

      const animate = () => {
        const progress = frame / totalFrames
        const revealed = Math.floor(progress * text.length)

        setDisplay(
          text
            .split('')
            .map((char, i) => {
              if (char === ' ') return ' '
              if (i < revealed) return char
              if (i < revealed + 4) return CHARS[Math.floor(Math.random() * CHARS.length)]
              return ' '
            })
            .join('')
        )

        if (frame < totalFrames) {
          frame++
          frameRef.current = requestAnimationFrame(animate) as unknown as number
        } else {
          setDisplay(text)
        }
      }
      frameRef.current = requestAnimationFrame(animate) as unknown as number
    }, delay)

    return () => {
      clearTimeout(timeoutRef.current)
      cancelAnimationFrame(frameRef.current)
    }
  }, [text, delay])

  return <span className={className} aria-label={text}>{display}</span>
}
