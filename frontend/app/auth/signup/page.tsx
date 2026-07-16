'use client'
import { useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'

const InteractiveWarp = dynamic(() => import('@/components/InteractiveWarp'), { ssr: false })

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [registerNumber, setRegisterNumber] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          register_number: registerNumber
        }
      }
    })
    if (signupError) { setError(signupError.message); setLoading(false); return }
    if (data.user) {
      const { error: profileError } = await supabase.from('users').insert({
        id: data.user.id,
        email: data.user.email,
        full_name: fullName,
        register_number: registerNumber,
        role: 'participant'
      })
      if (profileError && profileError.code !== '23505') console.error('Profile insert error:', profileError)
    }
    setLoading(false)
    setSuccess(true)
  }

  const inputStyle = { borderColor: 'rgba(255,255,255,0.08)' }

  if (success) return (
    <div className="min-h-screen relative flex items-center justify-center px-4 noise" style={{ background: '#06000F' }}>
      <InteractiveWarp />
      <div className="w-full max-w-md text-center relative z-10 p-8 border rounded-2xl backdrop-blur-md"
        style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="text-6xl mb-6">✉️</div>
        <h2 className="text-2xl font-bold font-mono uppercase tracking-wider text-white mb-4">Check email</h2>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">We sent a confirmation link to <span style={{ color: '#C8FF00' }}>{email}</span>. Click the link to activate your account.</p>
        <Link href="/auth/login" className="font-mono text-xs uppercase tracking-widest hover:text-white transition-colors" style={{ color: '#C8FF00' }}>Back to login →</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-28 noise" style={{ background: '#06000F' }}>
      <InteractiveWarp />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <Link href="/" className="font-mono text-xs uppercase tracking-[0.3em]" style={{ color: '#C8FF00' }}>⚡ Ahalia Overflow</Link>
          <h1 className="text-4xl font-bold tracking-tight text-white mt-4">Create account</h1>
          <p className="font-mono text-xs uppercase tracking-wider mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>Join the community</p>
        </div>

        <div className="rounded-2xl p-8 border backdrop-blur-md"
          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
          {error && <div className="bg-[#FF2D78]/10 border border-[#FF2D78]/30 text-[#FF2D78] px-4 py-3 rounded-xl mb-6 font-mono text-xs">{error}</div>}
          
          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="block text-gray-300 font-mono text-xs uppercase tracking-wider mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full bg-void border text-white rounded-xl px-4 py-3 focus:outline-none font-mono text-sm transition-colors focus:border-neon"
                style={inputStyle}
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-gray-300 font-mono text-xs uppercase tracking-wider mb-2">Register Number</label>
              <input
                type="text"
                value={registerNumber}
                onChange={(e) => setRegisterNumber(e.target.value.toUpperCase())}
                required
                className="w-full bg-void border text-white rounded-xl px-4 py-3 focus:outline-none font-mono text-sm transition-colors focus:border-neon"
                style={inputStyle}
                placeholder="e.g. ATP20CS001"
              />
            </div>
            <div>
              <label className="block text-gray-300 font-mono text-xs uppercase tracking-wider mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-void border text-white rounded-xl px-4 py-3 focus:outline-none font-mono text-sm transition-colors focus:border-neon"
                style={inputStyle}
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
                style={inputStyle}
                placeholder="At least 6 characters"
              />
            </div>
            <div>
              <label className="block text-gray-300 font-mono text-xs uppercase tracking-wider mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-void border text-white rounded-xl px-4 py-3 focus:outline-none font-mono text-sm transition-colors focus:border-neon"
                style={inputStyle}
                placeholder="••••••••"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full text-black font-bold font-mono text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all duration-200 hover:scale-[1.02]"
              style={{ background: '#C8FF00', boxShadow: '0 0 20px rgba(200,255,0,0.2)' }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm font-mono mt-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Already have an account?{' '}
            <Link href="/auth/login" className="hover:text-white transition-colors" style={{ color: '#C8FF00' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
