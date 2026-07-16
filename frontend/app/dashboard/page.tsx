'use client'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { getMyRegistrations, getCertificate, cancelRegistration } from '@/lib/api'
import TextScramble from '@/components/TextScramble'

const InteractiveWarp = dynamic(() => import('@/components/InteractiveWarp'), { ssr: false })

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
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        setUser(data.user)
        try {
          const { data: prof } = await supabase.from('users').select('*').eq('id', data.user.id).single()
          setProfile(prof)
        } catch (err) {
          console.error("Failed to load user profile:", err)
        }
        try {
          const regs = await getMyRegistrations()
          setRegistrations(Array.isArray(regs) ? regs : [])
        } catch (err) {
          console.error("Failed to load registrations:", err)
          setRegistrations([])
        }
      }
      setLoading(false)
    }).catch(() => {
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
    <div className="min-h-screen bg-void flex items-center justify-center">
      <div className="w-10 h-10 border border-t-transparent rounded-full animate-spin" style={{ borderColor: '#C8FF00' }} />
    </div>
  )

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there'

  return (
    <div className="min-h-screen relative px-4 py-28 noise" style={{ background: '#06000F' }}>
      <InteractiveWarp />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16 p-6 rounded-2xl border"
          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
          <div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white flex items-center gap-3">
              Hey <span style={{ color: '#C8FF00' }}>{displayName}</span> 👋
            </h1>
            <p className="font-mono text-xs uppercase mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>{user?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="font-mono text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all duration-300"
            style={{ border: '1px solid rgba(255,45,120,0.3)', color: '#FF2D78', background: 'rgba(255,45,120,0.05)' }}
          >
            Sign Out
          </button>
        </div>

        {/* Registrations list */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold font-mono uppercase tracking-wider text-white mb-8">
            {ready ? <TextScramble text="MY REGISTRATIONS" delay={150} /> : 'MY REGISTRATIONS'}
          </h2>

          {registrations.length === 0 ? (
            <div className="rounded-2xl p-16 text-center border"
              style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="font-mono text-6xl mb-6 opacity-25">🎟️</div>
              <p className="font-mono text-sm text-gray-500 uppercase tracking-widest">No registrations yet</p>
              <a href="/events" className="inline-block mt-8 font-mono text-xs font-bold uppercase tracking-widest px-8 py-3.5 rounded-xl text-black transition-all"
                style={{ background: '#C8FF00', boxShadow: '0 0 20px rgba(200,255,0,0.2)' }}>
                Browse Events
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {registrations.map((reg) => (
                <div
                  key={reg.id}
                  className="rounded-2xl p-6 border flex flex-col md:flex-row md:items-center gap-6"
                  style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">{reg.events?.title}</h3>
                    <div className="flex flex-wrap gap-4 mt-2 font-mono text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      <span>◷ {reg.events?.date ? format(new Date(reg.events.date), 'EEE, d MMM yyyy') : 'Coming Soon'}</span>
                      <span>◈ {reg.events?.venue || '—'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <div className="text-center font-mono">
                      <div className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Checked In</div>
                      <div className="text-xl mt-1">{reg.checked_in ? '🟢' : '⚫'}</div>
                    </div>

                    <div>
                      {reg.checked_in ? (
                        <div className="font-mono text-xs uppercase tracking-wider px-4 py-2 rounded-xl"
                          style={{ background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.3)', color: '#00E5FF' }}>
                          Attended
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 items-end">
                          <button
                            onClick={() => handleCancelRegistration(reg.id, reg.events?.title || 'event')}
                            disabled={cancellingId === reg.id}
                            className="font-mono text-xs uppercase tracking-wider px-4 py-2 rounded-xl transition-all"
                            style={{ border: '1px solid rgba(255,45,120,0.3)', color: '#FF2D78', background: 'rgba(255,45,120,0.05)' }}
                          >
                            {cancellingId === reg.id ? '...' : 'Cancel'}
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

      {/* Low-key organizer callout */}
      <div className="mt-20 border-t border-dashed py-8 text-center" style={{ borderColor: 'rgba(200,255,0,0.1)' }}>
        <p className="font-mono text-xs text-gray-500 uppercase tracking-widest">
          Are you an organizer? Want to host your own events?{' '}
          <a href="mailto:prawmathean@proton.me" className="text-[#C8FF00] hover:underline transition-all">
            Contact Developer (prawmathean@proton.me)
          </a>{' '}
          to request organizer access.
        </p>
      </div>
    </div>
  )
}
