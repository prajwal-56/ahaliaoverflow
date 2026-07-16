'use client'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { getEvents } from '@/lib/api'
import EventCard from '@/components/EventCard'
import TextScramble from '@/components/TextScramble'
import ScrollCardStack from '@/components/ScrollCardStack'

const InteractiveWarp = dynamic(() => import('@/components/InteractiveWarp'), { ssr: false })

interface Event {
  id: string
  title: string
  description: string
  date: string
  venue: string
  status: string
  cover_image_url: string | null
  capacity: number
}

type FilterType = 'all' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled'

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [filter, setFilter] = useState<FilterType>('all')
  const [loading, setLoading] = useState(true)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  useEffect(() => {
    setLoading(true)
    const status = filter === 'all' ? undefined : filter
    getEvents(status)
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [filter])

  const filters: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Upcoming', value: 'upcoming' },
    { label: 'Ongoing', value: 'ongoing' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
  ]

  return (
    <div className="min-h-screen relative px-4 py-28 noise" style={{ background: '#06000F' }}>
      <InteractiveWarp />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="mb-16">
          <div className="font-mono text-xs uppercase tracking-[0.3em] mb-4" style={{ color: 'rgba(200,255,0,0.7)' }}>
            ⚡ Browse events
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
            {ready ? <TextScramble text="ALL EVENTS" delay={100} /> : 'ALL EVENTS'}
          </h1>

          {/* Filter Bar */}
          <div className="flex flex-wrap gap-3 p-2 rounded-2xl border" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(10px)' }}>
            {filters.map((f) => {
              const active = filter === f.value
              return (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className="font-mono text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all duration-300"
                  style={{
                    background: active ? '#C8FF00' : 'transparent',
                    color: active ? '#000' : 'rgba(255,255,255,0.5)',
                    boxShadow: active ? '0 0 15px rgba(200,255,0,0.3)' : 'none',
                    fontWeight: active ? 'bold' : 'normal',
                  }}
                >
                  {f.label}
                </button>
              )
            })}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl h-80 animate-pulse border"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  borderColor: 'rgba(255,255,255,0.06)',
                }}
              />
            ))}
          </div>
        ) : events.length > 0 ? (
          <ScrollCardStack>
            {events.map((event) => (
              <EventCard key={event.id} {...event} accent={event.status === 'completed' ? 'plasma' : 'neon'} />
            ))}
          </ScrollCardStack>
        ) : (
          <div className="text-center py-32">
            <div className="font-mono text-6xl mb-4 opacity-20">{'{ ? }'}</div>
            <p className="font-mono text-gray-500 uppercase tracking-widest text-sm">No events found</p>
          </div>
        )}
      </div>
    </div>
  )
}
