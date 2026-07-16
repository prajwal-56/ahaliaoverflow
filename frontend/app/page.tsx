'use client'
import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { getEvents } from '@/lib/api'
import EventCard from '@/components/EventCard'
import TextScramble from '@/components/TextScramble'
import MagneticButton from '@/components/MagneticButton'
import { supabase } from '@/lib/supabase'

import GlitchText from '@/components/GlitchText'

const InteractiveWarp = dynamic(() => import('@/components/InteractiveWarp'), { ssr: false })

interface Event {
  id: string; title: string; description: string
  date: string; venue: string; status: string
  cover_image_url: string | null; capacity: number
}

function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

const MARQUEE_TEXT = 'STAY CURIOUS — BREAK THINGS — TINKER HARD — LEARN FAST — SHOW UP — '

export default function HomePage() {
  const [upcoming, setUpcoming] = useState<Event[]>([])
  const [completed, setCompleted] = useState<Event[]>([])
  const [user, setUser] = useState<any>(null)
  const [ready, setReady] = useState(false)

  const about = useReveal()
  const evts = useReveal(0.08)
  const hist = useReveal(0.08)
  const cta = useReveal(0.2)

  useEffect(() => {
    getEvents('upcoming').then(d => setUpcoming(Array.isArray(d) ? d.slice(0, 3) : []))
    getEvents('completed').then(d => setCompleted(Array.isArray(d) ? d.slice(0, 3) : []))
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    setTimeout(() => setReady(true), 80)
  }, [])

  return (
    <div className="flex flex-col noise">

      {/* ── WARP SPEED BG ── */}
      <InteractiveWarp />

      {/* ──────────── HERO ──────────── */}
      <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">

        {/* void gradient */}
        <div className="absolute inset-0 z-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(200,255,0,0.04) 0%, transparent 70%)' }} />

        {/* Big ambient glows */}
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(200,255,0,0.07) 0%, transparent 70%)', animation: 'glow-pulse 4s ease-in-out infinite' }} />
        <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,45,120,0.06) 0%, transparent 70%)', animation: 'glow-pulse 5s ease-in-out infinite 1.5s' }} />

        <div className={`relative z-10 text-center px-4 max-w-7xl mx-auto w-full transition-all duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}>

          {/* Eyebrow */}
          <div className="animate-fade-up mb-8" style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}>
            <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-mono font-semibold uppercase tracking-[0.2em]"
              style={{ border: '1px solid rgba(200,255,0,0.25)', background: 'rgba(200,255,0,0.05)', color: '#C8FF00' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#C8FF00] animate-ping-slow" />
              Your College Tech Community
            </span>
          </div>

          {/* GIANT HEADING */}
          <div className="mb-6 leading-[0.82] tracking-tight overflow-hidden">
            <div className="overflow-hidden">
              <div className="animate-word-in" style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>
                {ready && (
                  <TextScramble
                    text="AHALIA"
                    delay={300}
                    className="block text-[18vw] md:text-[14vw] font-bold text-outline select-none"
                  />
                )}
              </div>
            </div>
            <div className="overflow-hidden">
              <div className="animate-word-in" style={{ animationDelay: '0.35s', animationFillMode: 'backwards' }}>
                {ready && (
                  <TextScramble
                    text="OVERFLOW"
                    delay={600}
                    className="block text-[18vw] md:text-[14vw] font-bold glow-neon select-none text-neon"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Tagline */}
          <p className="animate-fade-up font-mono text-sm md:text-base text-gray-500 mb-14 tracking-[0.15em] uppercase"
            style={{ animationDelay: '0.8s', animationFillMode: 'backwards' }}>
            &gt;_ stay curious. break. tinker.{' '}
            <a href="https://www.instagram.com/tinkerhub.aset" className="text-[#C8FF00] hover:text-white transition-colors" style={{ textDecorationLine: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: '4px' }}>
              learn.
            </a>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center animate-fade-up"
            style={{ animationDelay: '1s', animationFillMode: 'backwards' }}>
            <MagneticButton href="/events">
              <span className="inline-flex items-center gap-2 font-bold text-black px-8 py-4 rounded-xl text-sm tracking-wider uppercase transition-all duration-200 hover:scale-105"
                style={{ background: '#C8FF00', boxShadow: '0 0 30px rgba(200,255,0,0.4), 0 0 60px rgba(200,255,0,0.15)' }}>
                Explore Events
                <span style={{ fontSize: '1.1em' }}>→</span>
              </span>
            </MagneticButton>

            <MagneticButton href={user ? '/dashboard' : '/auth/signup'}>
              <span className="inline-flex items-center gap-2 font-semibold text-white px-8 py-4 rounded-xl text-sm tracking-wider uppercase transition-all duration-200 hover:scale-105"
                style={{ border: '1px solid rgba(200,255,0,0.3)', background: 'rgba(200,255,0,0.05)', backdropFilter: 'blur(10px)' }}>
                {user ? 'Dashboard' : 'Join the Overflow'}
              </span>
            </MagneticButton>
          </div>
        </div>

        {/* Scroll line */}
        <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10 transition-all duration-700 delay-[1200ms] ${ready ? 'opacity-100' : 'opacity-0'}`}>
          <span className="font-mono text-[10px] tracking-[0.35em] uppercase" style={{ color: 'rgba(200,255,0,0.5)' }}>scroll</span>
          <div className="w-px h-12 overflow-hidden">
            <div className="w-full h-full animate-scroll-line" style={{ background: 'linear-gradient(to bottom, #C8FF00, transparent)' }} />
          </div>
        </div>
      </section>

      {/* ──────────── MARQUEE ──────────── */}
      <div className="relative overflow-hidden py-5 border-y" style={{ borderColor: 'rgba(200,255,0,0.1)', background: 'rgba(200,255,0,0.03)' }}>
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(3)].map((_, i) => (
            <span key={i} className="inline-flex items-center gap-8 mr-8 font-mono text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: 'rgba(200,255,0,0.45)' }}>
              {MARQUEE_TEXT.split('—').map((t, j) => (
                <span key={j} className="inline-flex items-center gap-8">
                  {t.trim() && <span>{t.trim()}</span>}
                  {t.trim() && <span style={{ color: 'rgba(200,255,0,0.2)' }}>◆</span>}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ──────────── ABOUT ──────────── */}
      <section className="py-36 px-4 relative overflow-hidden" id="about" style={{ background: 'rgba(6,0,15,0.8)' }}>
        <div ref={about.ref} className={`max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-24 items-center transition-all duration-1000 ${about.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>

          {/* Text side */}
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.3em] mb-6" style={{ color: 'rgba(200,255,0,0.7)' }}>
              01 / About
            </div>
            <h2 className="font-bold mb-8 leading-[0.9] tracking-tight" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)' }}>
              <span className="block text-white"><GlitchText text="Who" /></span>
              <span className="block text-outline-neon"><GlitchText text="We Are." /></span>
            </h2>
            <div className="space-y-5 text-gray-400 text-lg leading-relaxed max-w-md">
              <p>Ahalia Overflow isn&apos;t a formal club. There&apos;s no structure or hierarchies.</p>
              <p style={{ color: 'rgba(255,255,255,0.6)' }}>Just raw, unfiltered students who are inherently curious — or want to be.</p>
              <p>No commitments. No requirements.</p>
              <p className="font-semibold" style={{ color: '#C8FF00' }}>Just show up.</p>
            </div>
            <div className="mt-10">
              <Link href="/events" className="group inline-flex items-center gap-3 font-mono text-sm uppercase tracking-widest transition-colors" style={{ color: 'rgba(200,255,0,0.7)' }}>
                <span className="w-8 h-px bg-current group-hover:w-16 transition-all duration-300" />
                View events
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>

          {/* Image side */}
          <div className={`relative transition-all duration-1000 delay-300 ${about.visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-16'}`}>
            {/* Rotating neon ring behind image */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[110%] h-[110%] rounded-2xl border opacity-20 animate-spin-slow"
                style={{ borderColor: '#C8FF00', transformOrigin: 'center', position: 'absolute' }} />
            </div>
            <div className="relative rounded-2xl overflow-hidden"
              style={{ border: '1px solid rgba(200,255,0,0.15)', boxShadow: '0 0 60px rgba(200,255,0,0.08)' }}>
              <Image
                src="/richard_feynnman.jpg"
                alt="Richard Feynman"
                width={600} height={420}
                className="w-full object-cover"
              />
              {/* Green tint overlay */}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(200,255,0,0.08) 0%, transparent 60%)' }} />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-5 -right-5 px-4 py-3 rounded-xl font-mono text-xs" style={{ background: '#C8FF00', color: '#000' }}>
              <div className="font-bold">NERD ZONE</div>
              <div className="opacity-70">always open</div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────── UPCOMING EVENTS ──────────── */}
      <section className="py-36 px-4 relative" style={{ background: 'rgba(0,0,0,0.7)' }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(200,255,0,0.2), transparent)' }} />

        <div ref={evts.ref} className={`max-w-6xl mx-auto transition-all duration-1000 ${evts.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
          {/* Header */}
          <div className="flex items-end justify-between mb-20">
            <div>
              <div className="font-mono text-xs uppercase tracking-[0.3em] mb-5" style={{ color: 'rgba(200,255,0,0.7)' }}>
                02 / Events
              </div>
              <h2 className="font-bold leading-[0.9] tracking-tight" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)' }}>
                <span className="block text-white"><GlitchText text="What's" /></span>
                <span className="block text-outline"><GlitchText text="Coming." /></span>
              </h2>
            </div>
            <Link href="/events" className="group hidden md:inline-flex items-center gap-3 font-mono text-sm uppercase tracking-widest transition-colors" style={{ color: 'rgba(200,255,0,0.6)' }}>
              All events
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          {upcoming.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcoming.map((event, i) => (
                <div key={event.id}
                  className={`transition-all duration-700 ${evts.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}
                  style={{ transitionDelay: `${i * 100}ms` }}>
                  <EventCard {...event} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-28">
              <div className="font-mono text-6xl mb-4 opacity-20">{'{ }'}</div>
              <p className="font-mono text-gray-600 uppercase tracking-widest text-sm">No upcoming events</p>
            </div>
          )}
        </div>
      </section>

      {/* ──────────── PAST EVENTS ──────────── */}
      {completed.length > 0 && (
        <section className="py-36 px-4 relative" style={{ background: 'rgba(6,0,15,0.9)' }}>
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(255,45,120,0.2), transparent)' }} />
          <div ref={hist.ref} className={`max-w-6xl mx-auto transition-all duration-1000 ${hist.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
            <div className="mb-20">
              <div className="font-mono text-xs uppercase tracking-[0.3em] mb-5" style={{ color: 'rgba(255,45,120,0.7)' }}>
                03 / History
              </div>
              <h2 className="font-bold leading-[0.9] tracking-tight" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)' }}>
                <span className="block text-white"><GlitchText text="Our" /></span>
                <span className="block" style={{ WebkitTextStroke: '1.5px #FF2D78', color: 'transparent' }}><GlitchText text="Events." /></span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completed.map((event, i) => (
                <div key={event.id}
                  className={`transition-all duration-700 ${hist.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}
                  style={{ transitionDelay: `${i * 100}ms` }}>
                  <EventCard {...event} accent="plasma" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ──────────── CTA ──────────── */}
      <section className="py-48 px-4 relative overflow-hidden" style={{ background: '#000' }}>
        {/* Spinning rings */}
        <div className="absolute left-1/2 top-1/2 w-[700px] h-[700px] rounded-full border animate-spin-slow pointer-events-none"
          style={{ borderColor: 'rgba(200,255,0,0.06)', transform: 'translate(-50%, -50%) rotate(0deg)' }} />
        <div className="absolute left-1/2 top-1/2 w-[500px] h-[500px] rounded-full border animate-spin-slower pointer-events-none"
          style={{ borderColor: 'rgba(255,45,120,0.08)', transform: 'translate(-50%, -50%) rotate(0deg)' }} />
        <div className="absolute left-1/2 top-1/2 w-[300px] h-[300px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(200,255,0,0.07) 0%, transparent 70%)', transform: 'translate(-50%, -50%)', animation: 'glow-pulse 3s ease-in-out infinite' }} />

        <div ref={cta.ref} className={`relative max-w-4xl mx-auto text-center transition-all duration-1000 ${cta.visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="font-mono text-xs uppercase tracking-[0.3em] mb-8" style={{ color: 'rgba(200,255,0,0.6)' }}>
            04 / Join
          </div>
          <h2 className="font-bold mb-8 leading-[0.85] tracking-tight" style={{ fontSize: 'clamp(4rem, 9vw, 9rem)' }}>
            <span className="block text-white">Ready</span>
            <span className="block text-outline-neon animate-flicker">to join?</span>
          </h2>
          <p className="font-mono text-gray-500 uppercase tracking-[0.2em] text-sm mb-16">
            Signup and Stay Tuned — Or just show up.
          </p>
          <MagneticButton href="/events" strength={0.25}>
            <span className="inline-flex items-center gap-3 font-bold text-black px-12 py-5 rounded-2xl text-base tracking-widest uppercase transition-all duration-200 hover:scale-105"
              style={{ background: '#C8FF00', boxShadow: '0 0 50px rgba(200,255,0,0.5), 0 0 100px rgba(200,255,0,0.2)' }}>
              View Events
              <span>→</span>
            </span>
          </MagneticButton>
        </div>
      </section>
    </div>
  )
}
