'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const lastScrollY = useRef(0)

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

  // Scroll behavior: glass effect + hide on scroll down
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 20)
      // Hide when scrolling down fast, show when scrolling up
      if (y > lastScrollY.current + 8 && y > 120) {
        setHidden(true)
      } else if (y < lastScrollY.current - 4) {
        setHidden(false)
      }
      lastScrollY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('users').select('*').eq('id', userId).single()
    setProfile(data)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null); setProfile(null)
    router.push('/')
  }

  const initials = (profile?.full_name || user?.user_metadata?.full_name || user?.email || '?')
    .split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  const isActive = (href: string) => pathname === href

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        transform: hidden ? 'translateY(-100%)' : 'translateY(0)',
        background: scrolled
          ? 'rgba(3, 7, 18, 0.85)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent',
        boxShadow: scrolled ? '0 1px 40px rgba(0,0,0,0.4)' : 'none',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2 font-bold text-lg transition-all duration-300">
          <span className="text-indigo-400 group-hover:text-indigo-300 transition-colors">⚡</span>
          <span className="text-white/90 group-hover:text-white transition-colors tracking-tight">
            Ahalia <span className="text-indigo-400 group-hover:text-indigo-300 transition-colors">Overflow</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { href: '/events', label: 'Events' },
            { href: '/#about', label: 'About' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`relative text-sm font-medium transition-colors duration-200 group ${isActive(href) ? 'text-white' : 'text-gray-400 hover:text-white'}`}
            >
              {label}
              <span className={`absolute -bottom-0.5 left-0 h-px bg-indigo-400 transition-all duration-300 ${isActive(href) ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </Link>
          ))}
          {profile?.role === 'organizer' && (
            <Link
              href="/organizer"
              className={`relative text-sm font-medium transition-colors duration-200 group ${isActive('/organizer') ? 'text-indigo-400' : 'text-indigo-400/70 hover:text-indigo-300'}`}
            >
              Organizer
              <span className="absolute -bottom-0.5 left-0 h-px bg-indigo-400 w-0 group-hover:w-full transition-all duration-300" />
            </Link>
          )}
        </div>

        {/* Auth */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="group relative w-9 h-9 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-white text-sm font-bold transition-all duration-200 hover:scale-110 hover:shadow-lg hover:shadow-indigo-500/40"
              >
                {initials}
                {/* Online indicator */}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-gray-950" />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl shadow-2xl overflow-hidden border border-white/10"
                  style={{ background: 'rgba(17, 24, 39, 0.95)', backdropFilter: 'blur(20px)' }}
                >
                  <div className="px-4 py-3 border-b border-white/5">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Signed in as</p>
                    <p className="text-sm text-white font-semibold truncate mt-0.5">{user?.email}</p>
                  </div>
                  <Link href="/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-white transition-colors text-sm">
                    <span>📊</span> Dashboard
                  </Link>
                  {profile?.role === 'organizer' && (
                    <Link href="/organizer" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-white transition-colors text-sm">
                      <span>⚙️</span> Organizer Panel
                    </Link>
                  )}
                  <div className="border-t border-white/5">
                    <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors text-sm">
                      <span>🚪</span> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="text-gray-400 hover:text-white font-medium transition-colors text-sm">
                Log In
              </Link>
              <Link
                href="/auth/signup"
                className="relative overflow-hidden bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200 text-sm hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/30 group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative">Sign Up</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
