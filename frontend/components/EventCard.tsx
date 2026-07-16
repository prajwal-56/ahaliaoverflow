'use client'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { useRef, MouseEvent } from 'react'

interface EventCardProps {
  id: string
  title: string
  description: string
  date: string | null
  venue: string
  status: string
  cover_image_url: string | null
  capacity?: number
}

const statusConfig: Record<string, { label: string; className: string; glow: string }> = {
  upcoming: {
    label: 'Upcoming',
    className: 'bg-green-500/20 text-green-400 border-green-500/30',
    glow: 'rgba(34,197,94,0.15)',
  },
  ongoing: {
    label: 'Ongoing',
    className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    glow: 'rgba(59,130,246,0.15)',
  },
  completed: {
    label: 'Completed',
    className: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    glow: 'rgba(107,114,128,0.1)',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-red-500/20 text-red-400 border-red-500/30',
    glow: 'rgba(239,68,68,0.1)',
  },
}

export default function EventCard({ id, title, description, date, venue, status, cover_image_url }: EventCardProps) {
  const statusInfo = statusConfig[status] || statusConfig.upcoming
  const eventDate = date ? new Date(date) : null

  const cardRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    const glow = glowRef.current
    if (!card || !glow) return

    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // 3D tilt — max ±12 degrees
    const rotateX = ((y - centerY) / centerY) * -10
    const rotateY = ((x - centerX) / centerX) * 10

    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`

    // Moving glow follows mouse
    glow.style.opacity = '1'
    glow.style.background = `radial-gradient(300px circle at ${x}px ${y}px, ${statusInfo.glow}, transparent 70%)`
  }

  const handleMouseLeave = () => {
    const card = cardRef.current
    const glow = glowRef.current
    if (!card || !glow) return
    card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
    glow.style.opacity = '0'
  }

  return (
    <Link href={`/events/${id}`} className="group block h-full" style={{ cursor: 'none' }}>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative bg-gray-800/80 rounded-2xl overflow-hidden border border-gray-700/60 h-full flex flex-col backdrop-blur-sm"
        style={{
          transition: 'transform 0.15s ease, box-shadow 0.3s ease',
          transformStyle: 'preserve-3d',
          willChange: 'transform',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        }}
      >
        {/* Moving glow overlay */}
        <div
          ref={glowRef}
          className="absolute inset-0 z-10 pointer-events-none rounded-2xl transition-opacity duration-300"
          style={{ opacity: 0 }}
        />

        {/* Border glow on hover */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ boxShadow: `0 0 0 1px rgba(129,140,248,0.3), 0 0 40px -10px ${statusInfo.glow}` }}
        />

        {/* Image */}
        <div className="relative h-48 overflow-hidden flex-shrink-0">
          <Image
            src={cover_image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600'}
            alt={title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-800/90 via-gray-800/20 to-transparent" />

          {/* Status badge */}
          <div className="absolute top-3 left-3 z-20">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${statusInfo.className}`}>
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1 relative z-20" style={{ transform: 'translateZ(20px)' }}>
          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-200 transition-colors duration-300 line-clamp-2">
            {title}
          </h3>
          <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">{description}</p>
          <div className="space-y-1.5 border-t border-gray-700/50 pt-3 mt-auto">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <span className="text-base">📅</span>
              <span>{eventDate ? `${format(eventDate, 'EEE, d MMM yyyy')} · ${format(eventDate, 'h:mm a')}` : 'Coming Soon'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <span className="text-base">📍</span>
              <span className="truncate">{venue}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
