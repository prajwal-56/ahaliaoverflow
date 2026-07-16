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
  const lastY = useRef(0)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) { setUser(data.session.user); fetchProfile(data.session.user.id) }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user); fetchProfile(session.user.id)
        if (event === 'SIGNED_IN') {
          const { data: ex } = await supabase.from('users').select('id').eq('id', session.user.id).single()
          if (!ex) {
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

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 30)
      if (y > lastY.current + 10 && y > 100) setHidden(true)
      else if (y < lastY.current - 5) setHidden(false)
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const fetchProfile = async (id: string) => {
    const { data } = await supabase.from('users').select('*').eq('id', id).single()
    setProfile(data)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut(); setUser(null); setProfile(null); router.push('/')
  }

  const initials = (profile?.full_name || user?.user_metadata?.full_name || user?.email || '?')
    .split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <nav
      className="fixed top-4 left-1/2 z-50 w-full max-w-5xl px-4"
      style={{ transform: `translateX(-50%) translateY(${hidden ? '-120%' : '0'})`, transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1)' }}
    >
      <div
        className="flex items-center justify-between px-5 h-14 rounded-2xl"
        style={{
          background: scrolled ? 'rgba(6,0,15,0.9)' : 'rgba(6,0,15,0.6)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px)',
          border: scrolled ? '1px solid rgba(200,255,0,0.15)' : '1px solid rgba(255,255,255,0.06)',
          boxShadow: scrolled ? '0 0 40px rgba(200,255,0,0.05), 0 8px 40px rgba(0,0,0,0.6)' : '0 8px 40px rgba(0,0,0,0.4)',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2 font-bold text-sm tracking-wider uppercase font-mono">
          <span className="text-lg" style={{ color: '#C8FF00' }}>⚡</span>
          <span className="text-white/80 group-hover:text-white transition-colors">Ahalia</span>
          <span className="font-bold" style={{ color: '#C8FF00' }}>Overflow</span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6">
          {[{ href: '/events', label: 'Events' }, { href: '/#about', label: 'About' }].map(({ href, label }) => (
            <Link key={href} href={href}
              className="font-mono text-xs uppercase tracking-[0.15em] transition-colors relative group"
              style={{ color: pathname === href ? '#C8FF00' : 'rgba(255,255,255,0.45)' }}>
              {label}
              <span className="absolute -bottom-0.5 left-0 h-px bg-[#C8FF00] transition-all duration-300 w-0 group-hover:w-full" />
            </Link>
          ))}
          {profile?.role === 'organizer' && (
            <Link href="/organizer" className="font-mono text-xs uppercase tracking-[0.15em] transition-colors" style={{ color: 'rgba(200,255,0,0.6)' }}>
              Organizer
            </Link>
          )}
        </div>

        {/* Auth */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="relative w-9 h-9 rounded-full flex items-center justify-center text-black text-xs font-bold font-mono transition-all hover:scale-110"
                style={{ background: '#C8FF00', boxShadow: '0 0 14px rgba(200,255,0,0.5)' }}
              >
                {initials}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2" style={{ borderColor: 'var(--void)' }} />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-52 rounded-xl overflow-hidden"
                  style={{ background: 'rgba(6,0,15,0.97)', backdropFilter: 'blur(20px)', border: '1px solid rgba(200,255,0,0.15)', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}>
                  <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <p className="font-mono text-xs uppercase tracking-wider" style={{ color: 'rgba(200,255,0,0.5)' }}>Signed in as</p>
                    <p className="text-white text-sm font-semibold truncate mt-0.5">{user?.email}</p>
                  </div>
                  <Link href="/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-mono text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                    <span style={{ color: '#C8FF00' }}>▸</span> Dashboard
                  </Link>
                  {profile?.role === 'organizer' && (
                    <Link href="/organizer" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-mono text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                      <span style={{ color: '#C8FF00' }}>▸</span> Organizer Panel
                    </Link>
                  )}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-mono transition-colors hover:bg-red-500/10"
                      style={{ color: '#FF2D78' }}>
                      <span>▸</span> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="font-mono text-xs uppercase tracking-widest transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Login
              </Link>
              <Link href="/auth/signup"
                className="font-mono text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all hover:scale-105 text-black"
                style={{ background: '#C8FF00', boxShadow: '0 0 20px rgba(200,255,0,0.3)' }}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
