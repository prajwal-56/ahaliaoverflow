'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) { setUser(data.session.user); fetchProfile(data.session.user.id) }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
        if (event === 'SIGNED_IN') {
          const { data: existing } = await supabase.from('users').select('id').eq('id', session.user.id).single()
          if (!existing) {
            await supabase.from('users').insert({
              id: session.user.id, email: session.user.email,
              full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
              role: 'participant'
            })
          }
        }
      } else { setUser(null); setProfile(null) }
    })
    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('users').select('*').eq('id', userId).single()
    setProfile(data)
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null); setProfile(null)
    router.push('/')
  }

  const initials = (profile?.full_name || user?.user_metadata?.full_name || user?.email || '?')
    .split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <nav className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-indigo-400 hover:text-indigo-300 transition-colors">⚡ Ahalia Overflow</Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="/events" className="text-gray-400 hover:text-white transition-colors font-medium">Events</Link>
          <Link href="/#about" className="text-gray-400 hover:text-white transition-colors font-medium">About</Link>
          {profile?.role === 'organizer' && <Link href="/organizer" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">Organizer</Link>}
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setDropdownOpen(!dropdownOpen)} className="w-9 h-9 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-white text-sm font-bold transition-all">
                {initials}
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden">
                  <Link href="/dashboard" onClick={() => setDropdownOpen(false)} className="block px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors text-sm">📊 Dashboard</Link>
                  {profile?.role === 'organizer' && <Link href="/organizer" onClick={() => setDropdownOpen(false)} className="block px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors text-sm">⚙️ Organizer Panel</Link>}
                  <button onClick={handleSignOut} className="w-full text-left px-4 py-3 text-red-400 hover:bg-gray-700 transition-colors text-sm">🚪 Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="text-gray-400 hover:text-white font-medium transition-colors">Log In</Link>
              <Link href="/auth/signup" className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
