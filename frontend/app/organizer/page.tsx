'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { getEvents } from '@/lib/api'

interface Event { id: string; title: string; date: string; status: string; capacity: number }

export default function OrganizerPage() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) { router.push('/auth/login'); return }
      const { data: profile } = await supabase.from('users').select('role').eq('id', data.user.id).single()
      if (!profile || profile.role !== 'organizer') { router.push('/dashboard'); return }
      const eventsData = await getEvents()
      setEvents(Array.isArray(eventsData) ? eventsData : [])
      setLoading(false)
    }
    check()
  }, [router])

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const statusColors: Record<string, string> = {
    upcoming: 'text-green-400', ongoing: 'text-blue-400', completed: 'text-gray-400', cancelled: 'text-red-400',
  }

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-16">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="text-indigo-400 text-sm font-medium uppercase tracking-widest mb-2">Organizer</div>
            <h1 className="text-4xl font-bold text-white">Dashboard</h1>
          </div>
          <Link href="/organizer/events/new" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105">
            + Create Event
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="text-3xl font-bold text-indigo-400">{events.length}</div>
            <div className="text-gray-400 mt-1">Total Events</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="text-3xl font-bold text-indigo-400">{events.filter(e => e.status === 'upcoming').length}</div>
            <div className="text-gray-400 mt-1">Upcoming Events</div>
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-white mb-6">Manage Events</h2>
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">{event.title}</h3>
                <div className="flex gap-4 mt-1 text-sm">
                  <span className="text-gray-400">{event.date ? format(new Date(event.date), 'EEE, d MMM yyyy') : '—'}</span>
                  <span className={`font-medium capitalize ${statusColors[event.status] || 'text-gray-400'}`}>{event.status}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href={`/organizer/checkin/${event.id}`} className="bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/30 px-4 py-2 rounded-lg text-sm font-medium transition-all">
                  📷 Check-in
                </Link>
                <Link href={`/organizer/events/${event.id}/participants`} className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-600/30 px-4 py-2 rounded-lg text-sm font-medium transition-all">
                  👥 Participants
                </Link>
                <Link href={`/organizer/events/${event.id}/edit`} className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-600/30 px-4 py-2 rounded-lg text-sm font-medium transition-all">
                  ✏️ Edit
                </Link>
                <Link href={`/events/${event.id}`} className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-all">
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
