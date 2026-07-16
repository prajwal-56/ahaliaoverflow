'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { format } from 'date-fns'
import { getEvent, registerForEvent } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import WinnerCard from '@/components/WinnerCard'
import MagneticButton from '@/components/MagneticButton'

const InteractiveWarp = dynamic(() => import('@/components/InteractiveWarp'), { ssr: false })

interface Winner {
  id: string
  position: string
  prize: string | null
  users: { full_name: string; avatar_url: string | null }
}

interface EventDetail {
  id: string
  title: string
  description: string
  date: string
  venue: string
  status: string
  cover_image_url: string | null
  capacity: number
  host_organizer: string | null
  seats_left?: number
  registered_count?: number
  winners: Winner[]
  registration_fee?: number
  upi_qr_url?: string | null
}

const statusCfg: Record<string, { label: string; color: string }> = {
  upcoming:  { label: 'Upcoming',  color: '#C8FF00' },
  ongoing:   { label: 'Ongoing',   color: '#00E5FF' },
  completed: { label: 'Completed', color: '#888' },
  cancelled: { label: 'Cancelled', color: '#FF2D78' },
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [event, setEvent] = useState<EventDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  // Modal state
  const [showFreeConfirm, setShowFreeConfirm] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [transactionId, setTransactionId] = useState('')
  const [txnError, setTxnError] = useState('')
  const [registering, setRegistering] = useState(false)

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    getEvent(id).then((data) => { setEvent(data); setLoading(false) })
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [id])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const isPaid = (event?.registration_fee ?? 0) > 0

  const handleRegisterClick = () => {
    if (!user) { router.push(`/auth/login?redirectTo=/events/${id}`); return }
    if (isPaid) {
      setShowPaymentModal(true)
    } else {
      setShowFreeConfirm(true)
    }
  }

  // Free event registration
  const handleFreeRegister = async () => {
    setRegistering(true)
    try {
      await registerForEvent(id)
      showToast('Registered! Check your email for your QR code.', 'success')
      setShowFreeConfirm(false)
      const updatedData = await getEvent(id)
      setEvent(updatedData)
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error')
      setShowFreeConfirm(false)
    } finally {
      setRegistering(false)
    }
  }

  // Paid event registration
  const handlePaidRegister = async () => {
    const clean = transactionId.trim()
    if (clean.length < 12 || !/^[a-zA-Z0-9]+$/.test(clean)) {
      setTxnError('Enter a valid UPI Transaction ID (12+ alphanumeric characters, no spaces or symbols)')
      return
    }
    setTxnError('')
    setRegistering(true)
    try {
      await registerForEvent(id, clean)
      showToast('Registered! Check your email for your QR code.', 'success')
      setShowPaymentModal(false)
      setTransactionId('')
      const updatedData = await getEvent(id)
      setEvent(updatedData)
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error')
    } finally {
      setRegistering(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-void flex items-center justify-center">
      <div className="w-10 h-10 border border-t-transparent rounded-full animate-spin" style={{ borderColor: '#C8FF00' }} />
    </div>
  )

  if (!event) return (
    <div className="min-h-screen bg-void flex items-center justify-center font-mono text-gray-500 uppercase tracking-widest text-sm">Event not found</div>
  )

  const s = statusCfg[event.status] || statusCfg.upcoming
  const eventDate = event.date ? new Date(event.date) : null

  return (
    <div className="min-h-screen relative pb-24 noise" style={{ background: '#06000F', cursor: 'none' }}>
      <InteractiveWarp />

      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl font-mono text-xs uppercase tracking-wider text-black font-bold transition-all"
          style={{ background: toast.type === 'success' ? '#C8FF00' : '#FF2D78', boxShadow: toast.type === 'success' ? '0 0 20px rgba(200,255,0,0.4)' : '0 0 20px rgba(255,45,120,0.4)' }}>
          {toast.type === 'success' ? '✔' : '✘'} {toast.message}
        </div>
      )}

      {/* ──── FREE EVENT CONFIRM MODAL ──── */}
      {showFreeConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-2xl p-8 shadow-2xl relative"
            style={{ background: 'rgba(6,0,15,0.96)', border: '1px solid rgba(200,255,0,0.2)', boxShadow: '0 0 50px rgba(200,255,0,0.1)' }}>
            <h3 className="text-xl font-bold font-mono uppercase tracking-wider text-white mb-4">Confirm Registration</h3>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
              Register for <strong className="text-white">{event.title}</strong>? A QR ticket will be sent to your email.
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleFreeRegister}
                disabled={registering}
                className="flex-1 text-black font-bold font-mono text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all"
                style={{ background: '#C8FF00' }}
              >
                {registering ? 'Registering...' : 'Yes, Register'}
              </button>
              <button
                onClick={() => setShowFreeConfirm(false)}
                disabled={registering}
                className="flex-1 font-mono text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──── PAID EVENT PAYMENT MODAL ──── */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-md w-full rounded-2xl shadow-2xl my-8 relative"
            style={{ background: 'rgba(6,0,15,0.96)', border: '1px solid rgba(200,255,0,0.2)', boxShadow: '0 0 50px rgba(200,255,0,0.1)' }}>
            {/* Header */}
            <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-bold font-mono uppercase tracking-wider text-white">Complete Payment</h3>
                <button onClick={() => { setShowPaymentModal(false); setTransactionId(''); setTxnError('') }} className="text-gray-500 hover:text-white transition-colors text-2xl leading-none">×</button>
              </div>
              <p className="text-gray-500 text-xs font-mono uppercase mt-1">Pay via UPI to register for <strong className="text-white">{event.title}</strong></p>
            </div>

            <div className="p-6 space-y-6">
              {/* Amount */}
              <div className="rounded-xl p-4 flex items-center justify-between"
                style={{ background: 'rgba(200,255,0,0.05)', border: '1px solid rgba(200,255,0,0.2)' }}>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'rgba(200,255,0,0.7)' }}>Amount to Pay</div>
                  <div className="text-3xl font-bold font-mono text-white mt-1">₹{event.registration_fee?.toFixed(0)}</div>
                </div>
                <div className="text-3xl">💸</div>
              </div>

              {/* QR Code */}
              {event.upi_qr_url && (
                <div className="text-center">
                  <p className="text-gray-400 text-xs mb-4">Scan this QR code with any UPI app (GPay, PhonePe, Paytm, etc.)</p>
                  <div className="inline-block bg-white rounded-2xl p-2.5 shadow-xl">
                    <img src={event.upi_qr_url} alt="UPI QR Code" className="w-48 h-48 object-contain" />
                  </div>
                  <p className="text-gray-500 text-[10px] font-mono mt-3 uppercase tracking-wider">After paying, note your transaction ID from the success screen</p>
                </div>
              )}

              {/* Transaction ID */}
              <div>
                <label className="block text-gray-300 font-mono text-xs uppercase tracking-wider mb-2">
                  UPI Transaction ID <span className="text-[#FF2D78]">*</span>
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => { setTransactionId(e.target.value); setTxnError('') }}
                  placeholder="e.g. 425678901234 (12+ characters)"
                  className="w-full bg-void border text-white rounded-xl px-4 py-3 focus:outline-none font-mono text-sm transition-colors focus:border-neon"
                  style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                />
                {txnError && <p className="text-[#FF2D78] text-xs font-mono mt-2">{txnError}</p>}
                <p className="text-gray-500 text-[10px] font-mono mt-2 uppercase tracking-wider">
                  Find this in your UPI app under payment history → transaction details
                </p>
              </div>

              {/* Disclaimer */}
              <div className="rounded-xl p-3.5" style={{ background: 'rgba(255,45,120,0.05)', border: '1px solid rgba(255,45,120,0.2)' }}>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  ⚠️ Your registration will be <strong style={{ color: '#FF2D78' }}>pending verification</strong> until the organizer confirms your payment. You will still receive a QR ticket, but check-in requires verification.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowPaymentModal(false); setTransactionId(''); setTxnError('') }}
                  disabled={registering}
                  className="flex-1 font-mono text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all"
                  style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePaidRegister}
                  disabled={registering || !transactionId.trim()}
                  className="flex-1 text-black font-bold font-mono text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: '#C8FF00' }}
                >
                  {registering ? 'Registering...' : "I've Paid → Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Image */}
      <div className="relative h-96 md:h-[520px] overflow-hidden bg-void flex items-center justify-center pt-16">
        <Image
          src={event.cover_image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200'}
          alt=""
          fill
          className="object-cover blur-3xl opacity-10 scale-110"
          priority
        />
        <div className="relative w-full h-full max-w-4xl mx-auto z-10 flex items-center justify-center pb-16">
          <Image
            src={event.cover_image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200'}
            alt={event.title}
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0 z-20 pt-20 pb-6 px-4"
          style={{ background: 'linear-gradient(to top, #06000F 0%, rgba(6,0,15,0.8) 70%, transparent 100%)' }}>
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {/* Status chip */}
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider"
                style={{ background: `${s.color}15`, border: `1px solid ${s.color}30`, color: s.color }}>
                {s.label}
              </span>
              {event.host_organizer && event.host_organizer !== 'independent' && (
                <span className="px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider"
                  style={{ background: 'rgba(200,255,0,0.05)', border: '1px solid rgba(200,255,0,0.2)', color: '#C8FF00' }}>
                  Hosted by {event.host_organizer}
                </span>
              )}
              {/* ── Fee badge ── */}
              {isPaid ? (
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider"
                  style={{ background: 'rgba(255,45,120,0.08)', border: '1px solid rgba(255,45,120,0.3)', color: '#FF2D78' }}>
                  ₹{event.registration_fee?.toFixed(0)} Fee
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider"
                  style={{ background: 'rgba(200,255,0,0.08)', border: '1px solid rgba(200,255,0,0.2)', color: '#C8FF00' }}>
                  Free Entry
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-none">{event.title}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8 relative z-10">
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-2xl p-5 border backdrop-blur-md"
            style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="font-mono text-[10px] uppercase tracking-wider mb-2" style={{ color: '#C8FF00', opacity: 0.8 }}>⚡ Date & Time</div>
            {eventDate ? (
              <>
                <div className="text-white font-bold text-lg leading-tight">{format(eventDate, 'EEE, d MMM yyyy')}</div>
                <div className="text-gray-400 font-mono text-sm mt-1">{format(eventDate, 'h:mm a')}</div>
              </>
            ) : (
              <div className="text-white font-bold text-lg font-mono">Coming Soon</div>
            )}
          </div>
          <div className="rounded-2xl p-5 border backdrop-blur-md"
            style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="font-mono text-[10px] uppercase tracking-wider mb-2" style={{ color: '#C8FF00', opacity: 0.8 }}>⚡ Venue</div>
            <div className="text-white font-bold text-lg leading-tight">{event.venue}</div>
          </div>
          <div className="rounded-2xl p-5 border backdrop-blur-md"
            style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="font-mono text-[10px] uppercase tracking-wider mb-2" style={{ color: '#C8FF00', opacity: 0.8 }}>
              ⚡ {event.status === 'completed' ? 'Participation' : 'Capacity'}
            </div>
            {event.status === 'completed' ? (
              <>
                <div className="text-white font-bold text-lg leading-tight">Event Completed</div>
                <div className="font-mono text-sm mt-1" style={{ color: 'rgba(250,250,250,0.5)' }}>{event.registered_count || 0} registered</div>
              </>
            ) : (
              <>
                <div className="text-white font-bold text-lg leading-tight">{event.capacity} total seats</div>
                <div className="font-mono text-sm mt-1" style={{ color: '#00E5FF' }}>
                  {event.seats_left !== undefined ? `${event.seats_left} seats left` : 'Loading...'}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Paid Info Alert */}
        {isPaid && (event.status === 'upcoming' || event.status === 'ongoing') && (
          <div className="rounded-2xl p-5 mb-8 flex items-start gap-4"
            style={{ background: 'rgba(255,45,120,0.05)', border: '1px solid rgba(255,45,120,0.2)' }}>
            <div className="text-2xl mt-0.5">💳</div>
            <div>
              <div className="font-bold text-white text-sm font-mono uppercase tracking-wider">Paid Event — ₹{event.registration_fee?.toFixed(0)} Registration Fee</div>
              <p className="text-gray-400 text-sm mt-1 leading-relaxed">
                This event requires a registration fee. After clicking &quot;Register Now&quot;, you will be shown a UPI QR code to scan and pay. Enter your Transaction ID to complete registration.
              </p>
            </div>
          </div>
        )}

        {/* About / Description */}
        <div className="rounded-2xl p-6 border backdrop-blur-md mb-8"
          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="text-lg font-bold font-mono uppercase tracking-wider text-white mb-4">About this event</h2>
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{event.description}</p>
        </div>

        {/* Register Actions */}
        {(event.status === 'upcoming' || event.status === 'ongoing') && (
          <div className="mb-12">
            {eventDate === null ? (
              <button
                onClick={() => alert("You'll be notified when this event goes live!")}
                className="font-mono text-xs uppercase tracking-widest px-8 py-4 rounded-xl transition-all"
                style={{ border: '1px solid rgba(200,255,0,0.4)', background: 'rgba(200,255,0,0.05)', color: '#C8FF00' }}
              >
                Notify me when live
              </button>
            ) : event.seats_left !== undefined && event.seats_left <= 0 ? (
              <div className="rounded-2xl px-6 py-4 font-mono text-xs uppercase tracking-wider text-[#FF2D78] inline-block"
                style={{ background: 'rgba(255,45,120,0.05)', border: '1px solid rgba(255,45,120,0.2)' }}>
                🚫 Event is Fully Booked. Try contacting the organizer irl or reach out to support.
              </div>
            ) : (
              <MagneticButton onClick={handleRegisterClick}>
                <span className="inline-block font-mono text-xs font-bold uppercase tracking-widest px-10 py-4 rounded-xl text-black"
                  style={{
                    background: isPaid ? '#FF2D78' : '#C8FF00',
                    boxShadow: isPaid ? '0 0 30px rgba(255,45,120,0.3)' : '0 0 30px rgba(200,255,0,0.3)',
                  }}>
                  {isPaid ? `💳 Register & Pay ₹${event.registration_fee?.toFixed(0)}` : 'Register Now'}
                </span>
              </MagneticButton>
            )}
          </div>
        )}

        {/* Winners */}
        {event.winners && event.winners.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold font-mono uppercase tracking-wider text-white mb-6">🏆 Winners</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {event.winners.map((winner) => (
                <WinnerCard key={winner.id} full_name={winner.users.full_name} position={winner.position} prize={winner.prize} />
              ))}
            </div>
          </div>
        )}

        {/* Support */}
        <div className="rounded-2xl p-8 mt-16 text-center border relative overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="text-lg font-bold font-mono uppercase tracking-wider text-white mb-2">Need Help or Facing Issues?</h2>
          <p className="text-gray-400 text-sm max-w-lg mx-auto mb-8 leading-relaxed">
            If you did not receive your QR ticket, have queries about payment, or are facing any issues, feel free to contact us.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="mailto:prawmathean@proton.me" className="font-mono text-xs uppercase tracking-widest px-6 py-3 rounded-xl transition-colors hover:text-white"
              style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.02)' }}>
              ✉️ Email
            </a>
            <a href="https://wa.me/+917736221227?text=Hey%20%21%20I%20just%20wanted%20to%20ask%20you%20something%20about%20ahalia%20overflow.%0A" target="_blank" rel="noopener noreferrer"
              className="font-mono text-xs uppercase tracking-widest px-6 py-3 rounded-xl transition-all text-black font-bold"
              style={{ background: '#C8FF00', boxShadow: '0 0 15px rgba(200,255,0,0.2)' }}>
              💬 WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
