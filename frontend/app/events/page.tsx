'use client'
import { useEffect, useState } from 'react'
import { getEvents } from '@/lib/api'
import EventCard from '@/components/EventCard'

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
    <div className="min-h-screen bg-gray-950 px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <div className="text-indigo-400 text-sm font-medium uppercase tracking-widest mb-4">Browse</div>
          <h1 className="text-5xl font-bold text-white mb-8">All Events</h1>
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-5 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === f.value
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="bg-gray-800 rounded-xl h-80 animate-pulse" />)}
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => <EventCard key={event.id} {...event} />)}
          </div>
        ) : (
          <div className="text-center py-24 text-gray-500">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-2xl font-semibold text-gray-400">No events found</p>
            <p className="text-gray-600 mt-2">Try a different filter</p>
          </div>
        )}
      </div>
    </div>
  )
}
