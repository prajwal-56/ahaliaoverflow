'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { getEvent, registerForEvent } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import WinnerCard from '@/components/WinnerCard'

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
    if (!user) { router.push('/auth/login'); return }
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

  const statusColors: Record<string, string> = {
    upcoming: 'bg-green-500/20 text-green-400 border-green-500/30',
    ongoing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    completed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!event) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">Event not found.</div>
  )

  const eventDate = event.date ? new Date(event.date) : null

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-4 z-50 px-6 py-4 rounded-xl shadow-xl font-medium transition-all ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
          {toast.message}
        </div>
      )}

      {/* ──── FREE EVENT CONFIRM MODAL ──── */}
      {showFreeConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-gray-700 max-w-md w-full rounded-2xl p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-4">Confirm Registration</h3>
            <p className="text-gray-300 mb-6">
              Register for <strong className="text-indigo-400">{event.title}</strong>? A QR ticket will be sent to your email.
            </p>
            <div className="flex gap-4">
              <button onClick={handleFreeRegister} disabled={registering} className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-semibold py-3 rounded-lg transition-all">
                {registering ? 'Registering...' : 'Yes, Register'}
              </button>
              <button onClick={() => setShowFreeConfirm(false)} disabled={registering} className="flex-1 border border-gray-600 hover:border-gray-500 text-gray-300 font-semibold py-3 rounded-lg transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──── PAID EVENT PAYMENT MODAL ──── */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gray-800 border border-gray-700 max-w-md w-full rounded-2xl shadow-2xl my-8">
            {/* Header */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xl font-bold text-white">Complete Payment</h3>
                <button onClick={() => { setShowPaymentModal(false); setTransactionId(''); setTxnError('') }} className="text-gray-500 hover:text-white transition-colors text-2xl leading-none">×</button>
              </div>
              <p className="text-gray-400 text-sm">Pay via UPI to register for <strong className="text-white">{event.title}</strong></p>
            </div>

            <div className="p-6 space-y-6">
              {/* Amount */}
              <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-indigo-300 uppercase tracking-widest mb-1">Amount to Pay</div>
                  <div className="text-3xl font-bold text-white">₹{event.registration_fee?.toFixed(0)}</div>
                </div>
                <div className="text-4xl">💰</div>
              </div>

              {/* QR Code */}
              {event.upi_qr_url && (
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-3">Scan this QR code with any UPI app (GPay, PhonePe, Paytm, etc.)</p>
                  <div className="inline-block bg-white rounded-2xl p-3 shadow-xl">
                    <img src={event.upi_qr_url} alt="UPI QR Code" className="w-52 h-52 object-contain" />
                  </div>
                  <p className="text-gray-500 text-xs mt-3">After paying, note your <strong className="text-gray-300">Transaction ID</strong> from the payment success screen</p>
                </div>
              )}

              {/* Transaction ID */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  UPI Transaction ID <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => { setTransactionId(e.target.value); setTxnError('') }}
                  placeholder="e.g. 425678901234 (12+ characters)"
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors font-mono text-sm"
                />
                {txnError && <p className="text-red-400 text-xs mt-2">{txnError}</p>}
                <p className="text-gray-500 text-xs mt-2">
                  Find this in your UPI app under payment history → transaction details
                </p>
              </div>

              {/* Disclaimer */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                <p className="text-amber-300 text-xs">
                  ⚠️ Your registration will be <strong>pending verification</strong> until the organizer confirms your payment. You'll still receive a QR ticket, but check-in requires verification.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowPaymentModal(false); setTransactionId(''); setTxnError('') }}
                  disabled={registering}
                  className="flex-1 border border-gray-600 hover:border-gray-500 text-gray-300 font-semibold py-3 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePaidRegister}
                  disabled={registering || !transactionId.trim()}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all"
                >
                  {registering ? 'Registering...' : "I've Paid → Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Image */}
      <div className="relative h-96 md:h-[500px] overflow-hidden bg-gray-950 flex items-center justify-center">
        <Image
          src={event.cover_image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200'}
          alt=""
          fill
          className="object-cover blur-2xl opacity-20 scale-110"
          priority
        />
        <div className="relative w-full h-full max-w-4xl mx-auto z-10 flex items-center justify-center pb-24">
          <Image
            src={event.cover_image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200'}
            alt={event.title}
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-gray-950 via-gray-950/85 to-transparent pt-16 pb-6 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${statusColors[event.status] || statusColors.upcoming}`}>
                {event.status}
              </span>
              {event.host_organizer && event.host_organizer !== 'independent' && (
                <span className="px-3 py-1 rounded-full text-xs font-medium border border-indigo-500/30 bg-indigo-500/10 text-indigo-300">
                  Hosted by {event.host_organizer}
                </span>
              )}
              {/* ── Fee badge ── */}
              {isPaid ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold border border-amber-500/40 bg-amber-500/15 text-amber-300">
                  ₹{event.registration_fee?.toFixed(0)} Registration Fee
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-medium border border-green-500/30 bg-green-500/10 text-green-300">
                  Free Entry
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight drop-shadow-lg">{event.title}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8 relative z-10 pb-16">
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="text-indigo-400 text-xs uppercase tracking-widest mb-1">Date & Time</div>
            {eventDate ? (
              <>
                <div className="text-white font-semibold">{format(eventDate, 'EEE, d MMM yyyy')}</div>
                <div className="text-gray-400 text-sm">{format(eventDate, 'h:mm a')}</div>
              </>
            ) : (
              <div className="text-white font-semibold">Coming Soon</div>
            )}
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="text-indigo-400 text-xs uppercase tracking-widest mb-1">Venue</div>
            <div className="text-white font-semibold">{event.venue}</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="text-indigo-400 text-xs uppercase tracking-widest mb-1">
              {event.status === 'completed' ? 'Participation' : 'Capacity & Availability'}
            </div>
            {event.status === 'completed' ? (
              <>
                <div className="text-white font-semibold">Event Completed</div>
                <div className="text-indigo-300 text-sm mt-1">{event.registered_count || 0} participants registered</div>
              </>
            ) : (
              <>
                <div className="text-white font-semibold">{event.capacity} total seats</div>
                <div className="text-indigo-300 text-sm mt-1">
                  {event.seats_left !== undefined ? `${event.seats_left} seats left` : 'Loading...'}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Registration fee info card — shown for paid events */}
        {isPaid && (event.status === 'upcoming' || event.status === 'ongoing') && (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5 mb-8 flex items-start gap-4">
            <div className="text-3xl">💳</div>
            <div>
              <div className="text-amber-300 font-semibold text-sm">Paid Event — ₹{event.registration_fee?.toFixed(0)} Registration Fee</div>
              <p className="text-gray-400 text-sm mt-1">
                This event requires a registration fee. After clicking "Register Now", you'll be shown a UPI QR code to scan and pay. Enter your Transaction ID to complete registration.
              </p>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">About this event</h2>
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{event.description}</p>
        </div>

        {/* Register / CTA */}
        {(event.status === 'upcoming' || event.status === 'ongoing') && (
          <div className="mb-8">
            {eventDate === null ? (
              <button
                onClick={() => alert("You'll be notified when this event goes live!")}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 rounded-lg transition-all duration-200 hover:scale-105 text-lg"
              >
                Notify me when live
              </button>
            ) : event.seats_left !== undefined && event.seats_left <= 0 ? (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 font-semibold px-6 py-4 rounded-lg inline-block text-lg">
                🚫 Event is Fully Booked. Try contacting the organizer irl or reach out to us (Email/Whatsapp)
              </div>
            ) : user ? (
              <button
                onClick={handleRegisterClick}
                disabled={registering}
                className={`font-semibold px-8 py-4 rounded-lg transition-all duration-200 hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed text-lg text-white ${
                  isPaid
                    ? 'bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800'
                    : 'bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800'
                }`}
              >
                {isPaid ? `💳 Register & Pay ₹${event.registration_fee?.toFixed(0)}` : 'Register Now'}
              </button>
            ) : (
              <Link href={`/auth/login?redirectTo=/events/${event.id}`} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 rounded-lg transition-all duration-200 hover:scale-105 inline-block text-lg">
                Log In to Register
              </Link>
            )}
          </div>
        )}

        {/* Winners */}
        {event.winners && event.winners.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">🏆 Winners</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {event.winners.map((winner) => (
                <WinnerCard key={winner.id} full_name={winner.users.full_name} position={winner.position} prize={winner.prize} />
              ))}
            </div>
          </div>
        )}

        {/* Support */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mt-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl" />
          <h2 className="text-xl font-bold text-white mb-2">Need Help or Facing Difficulties?</h2>
          <p className="text-gray-400 text-sm max-w-lg mx-auto mb-6">
            If you didn&apos;t receive your QR ticket, have queries about payment, or are facing any issues, feel free to contact us.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="mailto:prawmathean@proton.me" className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 border border-gray-700">
              ✉️ Email
            </a>
            <a href="https://wa.me/+917736221227?text=Hey%20%21%20I%20just%20wanted%20to%20ask%20you%20something%20about%20ahalia%20overflow.%0A" target="_blank" rel="noopener noreferrer" className="bg-green-600/10 hover:bg-green-600/20 text-green-400 border border-green-500/20 px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2">
              💬 WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
