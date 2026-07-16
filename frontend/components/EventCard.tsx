'use client'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { useRef, MouseEvent } from 'react'

interface EventCardProps {
  id: string; title: string; description: string
  date: string | null; venue: string; status: string
  cover_image_url: string | null; capacity?: number
  accent?: 'neon' | 'plasma'
}

const statusCfg: Record<string, { label: string; color: string }> = {
  upcoming:  { label: 'Upcoming',  color: '#C8FF00' },
  ongoing:   { label: 'Ongoing',   color: '#00E5FF' },
  completed: { label: 'Completed', color: '#888' },
  cancelled: { label: 'Cancelled', color: '#FF2D78' },
}

export default function EventCard({ id, title, description, date, venue, status, cover_image_url, accent = 'neon' }: EventCardProps) {
  const s = statusCfg[status] || statusCfg.upcoming
  const eventDate = date ? new Date(date) : null
  const cardRef = useRef<HTMLDivElement>(null)
  const shineRef = useRef<HTMLDivElement>(null)

  const neonColor = accent === 'plasma' ? '#FF2D78' : '#C8FF00'

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current; const shine = shineRef.current
    if (!card || !shine) return
    const r = card.getBoundingClientRect()
    const x = e.clientX - r.left, y = e.clientY - r.top
    const cx = r.width / 2, cy = r.height / 2
    const rx = ((y - cy) / cy) * -10
    const ry = ((x - cx) / cx) * 10
    card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02,1.02,1.02)`
    shine.style.opacity = '1'
    // Holographic: mix angle + neon color
    const angle = Math.atan2(y - cy, x - cx) * (180 / Math.PI)
    shine.style.background = `
      radial-gradient(280px circle at ${x}px ${y}px, rgba(255,255,255,0.04), transparent 60%),
      conic-gradient(from ${angle}deg at ${x}px ${y}px, ${neonColor}18, transparent 60%)
    `
  }

  const onLeave = () => {
    const card = cardRef.current; const shine = shineRef.current
    if (!card || !shine) return
    card.style.transform = 'perspective(900px) rotateX(0) rotateY(0) scale3d(1,1,1)'
    shine.style.opacity = '0'
  }

  return (
    <Link href={`/events/${id}`} className="block h-full" style={{ cursor: 'none' }}>
      <div
        ref={cardRef}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="relative h-full flex flex-col rounded-2xl overflow-hidden group"
        style={{
          background: 'rgba(10,10,18,0.95)',
          border: '1px solid rgba(255,255,255,0.06)',
          transition: 'transform 0.12s ease, box-shadow 0.3s ease',
          transformStyle: 'preserve-3d',
          willChange: 'transform',
          boxShadow: '0 4px 30px rgba(0,0,0,0.5)',
        }}
      >
        {/* Holographic shimmer overlay */}
        <div ref={shineRef} className="absolute inset-0 z-10 pointer-events-none rounded-2xl transition-opacity duration-200" style={{ opacity: 0 }} />

        {/* Hover border glow */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ boxShadow: `0 0 0 1px ${neonColor}40, 0 0 40px -10px ${neonColor}30` }} />

        {/* Image */}
        <div className="relative h-48 flex-shrink-0 overflow-hidden">
          <Image
            src={cover_image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600'}
            alt={title} fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,10,18,1) 0%, rgba(10,10,18,0.3) 50%, transparent 100%)' }} />
          {/* Status chip */}
          <div className="absolute top-3 left-3 z-20">
            <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider"
              style={{ background: `${s.color}15`, border: `1px solid ${s.color}40`, color: s.color }}>
              {s.label}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1 relative z-20" style={{ transform: 'translateZ(20px)' }}>
          <h3 className="font-bold text-white mb-2 line-clamp-2 text-lg group-hover:transition-colors duration-300"
            style={{ color: 'rgba(255,255,255,0.95)' }}>
            {title}
          </h3>
          <p className="text-sm mb-5 line-clamp-2 flex-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{description}</p>
          <div className="space-y-1.5 border-t pt-3" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 text-sm font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <span style={{ color: neonColor, opacity: 0.7 }}>◷</span>
              <span>{eventDate ? `${format(eventDate, 'd MMM yyyy')} · ${format(eventDate, 'h:mm a')}` : 'Coming Soon'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <span style={{ color: neonColor, opacity: 0.7 }}>◈</span>
              <span className="truncate">{venue}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
