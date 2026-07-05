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
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [event, setEvent] = useState<EventDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [registering, setRegistering] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    getEvent(id).then((data) => { setEvent(data); setLoading(false) })
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [id])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const handleRegisterClick = () => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    setShowConfirm(true)
  }

  const handleRegister = async () => {
    setRegistering(true)
    try {
      await registerForEvent(id)
      showToast('Registered! Check your email for your QR code.', 'success')
      setShowConfirm(false)
      // Refresh event details to fetch updated seats_left
      const updatedData = await getEvent(id)
      setEvent(updatedData)
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error')
      setShowConfirm(false)
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
      {toast && (
        <div className={`fixed top-20 right-4 z-50 px-6 py-4 rounded-xl shadow-xl font-medium transition-all ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        } text-white`}>
          {toast.message}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-gray-700 max-w-md w-full rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold text-white mb-4">Confirm Registration</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to register for <strong className="text-indigo-400">{event.title}</strong>? A unique ticket with a QR code will be generated and sent to your email.
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleRegister}
                disabled={registering}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-semibold py-3 rounded-lg transition-all"
              >
                {registering ? 'Registering...' : 'Yes, Confirm'}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                disabled={registering}
                className="flex-1 border border-gray-600 hover:border-gray-500 text-gray-300 font-semibold py-3 rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative h-96 md:h-[500px] overflow-hidden bg-gray-950 flex items-center justify-center">
        {/* Blurred background image to fill space beautifully without cut-off */}
        <Image
          src={event.cover_image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200'}
          alt=""
          fill
          className="object-cover blur-2xl opacity-20 scale-110"
          priority
        />
        {/* Fully visible container image */}
        <div className="relative w-full h-full max-w-4xl mx-auto z-10 flex items-center justify-center pb-24">
          <Image
            src={event.cover_image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200'}
            alt={event.title}
            fill
            className="object-contain"
            priority
          />
        </div>
        
        {/* Bottom Banner Overlay for Text (Title and Badges) with background opacity */}
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
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight drop-shadow-lg">{event.title}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8 relative z-10 pb-16">
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
                <div className="text-indigo-300 text-sm mt-1">
                  {event.registered_count || 0} participants registered
                </div>
              </>
            ) : (
              <>
                <div className="text-white font-semibold">{event.capacity} total seats</div>
                <div className="text-indigo-300 text-sm mt-1">
                  {event.seats_left !== undefined ? `${event.seats_left} seats left` : 'Loading availability...'}
                </div>
              </>
            )}
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">About this event</h2>
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{event.description}</p>
        </div>
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
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-semibold px-8 py-4 rounded-lg transition-all duration-200 hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed text-lg"
              >
                Register Now
              </button>
            ) : (
              <Link href={`/auth/login?redirectTo=/events/${event.id}`} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 rounded-lg transition-all duration-200 hover:scale-105 inline-block text-lg">
                Log In to Register
              </Link>
            )}
          </div>
        )}
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

        {/* Support/Help Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mt-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl" />
          <h2 className="text-xl font-bold text-white mb-2">Need Help or Facing Difficulties?</h2>
          <p className="text-gray-400 text-sm max-w-lg mx-auto mb-6">
            If you are confused about how the website works, didn&apos;t receive your QR ticket, facing any difficulties/bugs, have queries about this event Or if you just wanna say Hi, feel free to contact us.
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
