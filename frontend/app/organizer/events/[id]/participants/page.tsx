'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getEvent, getEventRegistrations } from '@/lib/api'

interface Registration {
  id: string
  checked_in: boolean
  checked_in_at: string | null
  registered_at: string
  users: {
    full_name: string
    email: string
    register_number: string | null
  }
}

interface EventDetail {
  title: string
  date: string
  venue: string
}

export default function ParticipantsListPage() {
  const { id } = useParams<{ id: string }>()
  const [event, setEvent] = useState<EventDetail | null>(null)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    Promise.all([
      getEvent(id),
      getEventRegistrations(id)
    ])
      .then(([eventData, regsData]) => {
        setEvent(eventData)
        setRegistrations(Array.isArray(regsData) ? regsData : [])
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message || 'Failed to load participants list.')
        setLoading(false)
      })
  }, [id])

  const filteredRegistrations = registrations.filter((reg) => {
    const term = search.toLowerCase()
    const name = reg.users?.full_name?.toLowerCase() || ''
    const email = reg.users?.email?.toLowerCase() || ''
    const regNum = reg.users?.register_number?.toLowerCase() || ''
    return name.includes(term) || email.includes(term) || regNum.includes(term)
  })

  // Simple CSV Export function
  const handleExportCSV = () => {
    if (!registrations.length) return
    const headers = ['Name', 'Email', 'Register Number', 'Registered At', 'Checked In', 'Checked In At']
    const rows = registrations.map((reg) => [
      reg.users?.full_name || '',
      reg.users?.email || '',
      reg.users?.register_number || 'N/A',
      reg.registered_at ? new Date(reg.registered_at).toLocaleString() : '',
      reg.checked_in ? 'Yes' : 'No',
      reg.checked_in_at ? new Date(reg.checked_in_at).toLocaleString() : ''
    ])
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n')
      
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    const eventNameSafe = event?.title.replace(/\s+/g, '_').toLowerCase() || 'event'
    link.setAttribute("download", `${eventNameSafe}_participants.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/organizer" className="text-gray-400 hover:text-white transition-colors">← Back</Link>
          <div>
            <span className="text-indigo-400 text-sm font-medium uppercase tracking-widest">Participants List</span>
            <h1 className="text-3xl font-bold text-white mt-1">{event?.title}</h1>
          </div>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>}

        <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 max-w-md relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email or register number..."
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-3 pl-10 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
              />
              <span className="absolute left-3 top-3.5 text-gray-500">🔍</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm">{filteredRegistrations.length} of {registrations.length} registered</span>
              <button
                onClick={handleExportCSV}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2.5 rounded-lg transition-colors text-sm flex items-center gap-2"
              >
                📤 Export CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredRegistrations.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <span className="text-4xl block mb-2">👥</span>
                No participants found
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-900/50 text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-700">
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Register Number</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Registration Date</th>
                    <th className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50 text-sm text-gray-300">
                  {filteredRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-gray-700/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{reg.users?.full_name || 'N/A'}</td>
                      <td className="px-6 py-4 font-mono text-indigo-300">{reg.users?.register_number || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-400">{reg.users?.email || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-400">{new Date(reg.registered_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-center">
                        {reg.checked_in ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs font-semibold border border-green-500/20">Checked In</span>
                            {reg.checked_in_at && (
                              <span className="text-[10px] text-gray-500 mt-1">{new Date(reg.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            )}
                          </div>
                        ) : (
                          <span className="bg-gray-700/30 text-gray-500 px-3 py-1 rounded-full text-xs font-semibold border border-gray-700/50">Absent</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
