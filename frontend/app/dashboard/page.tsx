'use client'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { getMyRegistrations, getCertificate, cancelRegistration } from '@/lib/api'

interface Registration {
  id: string
  checked_in: boolean
  registered_at: string
  events: { id: string; title: string; date: string; venue: string; status: string }
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        setUser(data.user)
        const { data: prof } = await supabase.from('users').select('*').eq('id', data.user.id).single()
        setProfile(prof)
        const regs = await getMyRegistrations()
        setRegistrations(Array.isArray(regs) ? regs : [])
      }
      setLoading(false)
    })
  }, [])

  const handleDownloadCertificate = async (regId: string, eventTitle: string) => {
    setDownloadingId(regId)
    try {
      const blobUrl = await getCertificate(regId)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `certificate-${eventTitle.replace(/\s+/g, '-').toLowerCase()}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
    } catch (err: any) {
      alert(err.message || 'Failed to download certificate')
    } finally {
      setDownloadingId(null)
    }
  }

  const handleCancelRegistration = async (regId: string, eventTitle: string) => {
    if (!confirm(`Are you sure you want to cancel your registration for "${eventTitle}"?`)) return
    setCancellingId(regId)
    try {
      await cancelRegistration(regId)
      setRegistrations((prev) => prev.filter((r) => r.id !== regId))
    } catch (err: any) {
      alert(err.message || 'Failed to cancel registration')
    } finally {
      setCancellingId(null)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there'

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-16">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold text-white">Hey {displayName} 👋</h1>
            <p className="text-gray-400 mt-2">{user?.email}</p>
          </div>
          <button onClick={handleSignOut} className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-4 py-2 rounded-lg transition-all duration-200 border border-gray-700">
            Sign Out
          </button>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-white mb-6">My Registrations</h2>
          {registrations.length === 0 ? (
            <div className="bg-gray-800 rounded-2xl p-12 border border-gray-700 text-center">
              <div className="text-5xl mb-4">🎟️</div>
              <p className="text-xl text-gray-400">No registrations yet</p>
              <p className="text-gray-600 mt-2">Register for an event to see it here</p>
              <a href="/events" className="inline-block mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-lg transition-all">Browse Events</a>
            </div>
          ) : (
            <div className="space-y-4">
              {registrations.map((reg) => (
                <div key={reg.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">{reg.events?.title}</h3>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-400">
                        <span>📅 {reg.events?.date ? format(new Date(reg.events.date), 'EEE, d MMM yyyy') : 'Coming Soon'}</span>
                        <span>📍 {reg.events?.venue || '—'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">Checked In</div>
                        <div className="text-2xl">{reg.checked_in ? '✅' : '❌'}</div>
                      </div>
                      <div className="text-center">
                        {reg.checked_in ? (
                          <div className="bg-green-500/10 text-green-400 px-3 py-1.5 rounded-lg text-xs font-semibold border border-green-500/20">
                            Attended
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2 items-center">
                            <span className="text-xs text-gray-500 italic block">Attend to unlock</span>
                            <button
                              onClick={() => handleCancelRegistration(reg.id, reg.events?.title || 'event')}
                              disabled={cancellingId === reg.id}
                              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs px-3 py-1.5 rounded-lg transition-all"
                            >
                              {cancellingId === reg.id ? 'Cancelling...' : 'Cancel'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
