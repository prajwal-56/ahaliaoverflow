'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'
import MagneticButton from '@/components/MagneticButton'

const InteractiveWarp = dynamic(() => import('@/components/InteractiveWarp'), { ssr: false })

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else { router.push('/dashboard') }
  }

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` }
    })
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-28 noise" style={{ background: '#06000F' }}>
      <InteractiveWarp />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <Link href="/" className="font-mono text-xs uppercase tracking-[0.3em]" style={{ color: '#C8FF00' }}>⚡ Ahalia Overflow</Link>
          <h1 className="text-4xl font-bold tracking-tight text-white mt-4">Welcome back</h1>
          <p className="font-mono text-xs uppercase tracking-wider mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>Sign in to your account</p>
        </div>

        <div className="rounded-2xl p-8 border backdrop-blur-md"
          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
          {error && <div className="bg-[#FF2D78]/10 border border-[#FF2D78]/30 text-[#FF2D78] px-4 py-3 rounded-xl mb-6 font-mono text-xs">{error}</div>}
          
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-bold font-mono text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl hover:bg-gray-100 transition-all duration-200 mb-6"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google Sign In
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}></div></div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-wider"><span className="px-3" style={{ background: '#0C0C18', color: 'rgba(255,255,255,0.4)' }}>or continue with email</span></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-gray-300 font-mono text-xs uppercase tracking-wider mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-void border text-white rounded-xl px-4 py-3 focus:outline-none font-mono text-sm transition-colors focus:border-neon"
                style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-gray-300 font-mono text-xs uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-void border text-white rounded-xl px-4 py-3 focus:outline-none font-mono text-sm transition-colors focus:border-neon"
                style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full text-black font-bold font-mono text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all duration-200 hover:scale-[1.02]"
              style={{ background: '#C8FF00', boxShadow: '0 0 20px rgba(200,255,0,0.2)' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm font-mono mt-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="hover:text-white transition-colors" style={{ color: '#C8FF00' }}>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
