'use client'
import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getEvents } from '@/lib/api'
import EventCard from '@/components/EventCard'
import { supabase } from '@/lib/supabase'

interface Event {
  id: string
  title: string
  description: string
  date: string
  venue: string
  status: string
  cover_image_url: string | null
  capacity: number
}

// Hook: trigger animation when element enters viewport
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

// Animated word split component
function AnimatedHeading({ text, className }: { text: string; className?: string }) {
  const words = text.split(' ')
  return (
    <span className={className}>
      {words.map((word, wi) => (
        <span key={wi} className="inline-block overflow-hidden mr-[0.25em]">
          <span
            className="inline-block animate-word-in"
            style={{ animationDelay: `${wi * 0.12}s`, animationFillMode: 'backwards' }}
          >
            {word}
          </span>
        </span>
      ))}
    </span>
  )
}

// Parallax orb that moves on scroll
function ParallaxOrb({ className, speed = 0.3 }: { className: string; speed?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onScroll = () => {
      const y = window.scrollY * speed
      el.style.transform = `translateY(${y}px)`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [speed])
  return <div ref={ref} className={className} />
}

export default function HomePage() {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [completedEvents, setCompletedEvents] = useState<Event[]>([])
  const [user, setUser] = useState<any>(null)
  const [heroReady, setHeroReady] = useState(false)

  const about = useReveal()
  const eventsSection = useReveal(0.1)
  const historySection = useReveal(0.1)
  const ctaSection = useReveal(0.2)

  useEffect(() => {
    getEvents('upcoming').then((data) => setUpcomingEvents(Array.isArray(data) ? data.slice(0, 3) : []))
    getEvents('completed').then((data) => setCompletedEvents(Array.isArray(data) ? data.slice(0, 3) : []))
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    // Slight delay so hero appears to "load in"
    const t = setTimeout(() => setHeroReady(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="flex flex-col" style={{ cursor: 'none' }}>

      {/* ──────────── HERO ──────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600"
            alt="Technology background"
            fill
            className="object-cover opacity-10"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-indigo-950/70 to-gray-950" />
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 z-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />

        {/* Parallax orbs */}
        <ParallaxOrb
          speed={0.25}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]"
        />
        <ParallaxOrb
          speed={0.15}
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]"
        />
        <ParallaxOrb
          speed={0.4}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-600/5 rounded-full blur-[150px]"
        />

        {/* Hero content */}
        <div className={`relative z-10 text-center px-4 max-w-5xl mx-auto transition-all duration-1000 ${heroReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Badge */}
          <div className={`inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-2 mb-10 text-indigo-300 text-sm font-medium backdrop-blur-sm transition-all duration-700 delay-200 ${heroReady ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
            Your College Tech Community
          </div>

          <h1 className="font-serif text-7xl md:text-9xl font-bold text-white mb-6 leading-[0.9] tracking-tight">
            {heroReady && (
              <>
                <AnimatedHeading text="Ahalia" className="block" />
                <span className="block overflow-hidden">
                  <span
                    className="block animate-word-in text-transparent bg-clip-text"
                    style={{
                      backgroundImage: 'linear-gradient(135deg, #818cf8, #c084fc, #67e8f9)',
                      animationDelay: '0.18s',
                      animationFillMode: 'backwards'
                    }}
                  >
                    Overflow
                  </span>
                </span>
              </>
            )}
          </h1>

          <p className={`text-xl md:text-2xl text-indigo-300/80 font-mono mb-12 max-w-2xl mx-auto leading-relaxed transition-all duration-700 delay-500 ${heroReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            &gt; stay Curious. Break.{' '}
            <a href="https://www.instagram.com/tinkerhub.aset" className="text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-4 decoration-indigo-500/40">
              Tinker.
            </a>{' '}
            Learn.
          </p>

          <div className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 delay-700 ${heroReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Link href="/events" className="group relative bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/30 overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative">Explore Events →</span>
            </Link>
            {user ? (
              <Link href="/dashboard" className="border border-indigo-500/40 hover:border-indigo-400 text-indigo-300 hover:text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:bg-indigo-500/10 backdrop-blur-sm">
                Go to Dashboard
              </Link>
            ) : (
              <Link href="/auth/signup" className="border border-indigo-500/40 hover:border-indigo-400 text-indigo-300 hover:text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:bg-indigo-500/10 backdrop-blur-sm">
                Join the Overflow
              </Link>
            )}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 transition-all duration-700 delay-1000 ${heroReady ? 'opacity-100' : 'opacity-0'}`}>
          <span className="text-xs text-gray-500 uppercase tracking-widest font-mono">Scroll</span>
          <div className="w-px h-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-400 to-transparent animate-scroll-line" />
          </div>
        </div>
      </section>

      {/* ──────────── ABOUT ──────────── */}
      <section className="py-32 px-4 bg-gray-900 relative overflow-hidden" id="about">
        {/* Decorative blobs */}
        <div className="absolute -right-40 top-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

        <div
          ref={about.ref}
          className={`max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center transition-all duration-1000 ${about.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}
        >
          <div>
            <div className="inline-block text-indigo-400 text-xs font-semibold uppercase tracking-[0.3em] mb-6 border border-indigo-500/30 rounded-full px-4 py-1.5 bg-indigo-500/5">
              About Us
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight">
              Who <br />
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #818cf8, #c084fc)' }}>
                We Are
              </span>
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-5">
              Ahalia Overflow isn&apos;t a formal club. There&apos;s no structure or hierarchies. It&apos;s just a collection of raw and unfiltered versions of students who are inherently curious or want to be.
            </p>
            <p className="text-gray-400 leading-relaxed mb-4">
              It&apos;s made by people who want to do nerdy stuff for the people who want to do nerdy stuff.
            </p>
            <p className="text-gray-400 leading-relaxed">
              There are no commitments or requirements — just show up.
            </p>
            <div className="flex gap-4 mt-10">
              <Link href="/events" className="group inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                View our events
                <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </div>

          <div
            className={`relative transition-all duration-1000 delay-300 ${about.visible ? 'opacity-100 translate-x-0 rotate-0' : 'opacity-0 translate-x-12 rotate-2'}`}
          >
            {/* Floating frame effect */}
            <div className="absolute -inset-4 bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-transparent rounded-3xl blur-2xl animate-pulse" />
            <div className="absolute -top-3 -right-3 w-24 h-24 border-2 border-indigo-500/30 rounded-2xl" />
            <div className="absolute -bottom-3 -left-3 w-16 h-16 border border-purple-500/30 rounded-xl" />
            <Image
              src="/richard_feynnman.jpg"
              alt="Study hard what interests you the most"
              width={600}
              height={400}
              className="relative rounded-2xl object-cover w-full border border-gray-700/50 shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* ──────────── UPCOMING EVENTS ──────────── */}
      <section className="py-32 px-4 bg-gray-950 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

        <div
          ref={eventsSection.ref}
          className={`max-w-6xl mx-auto transition-all duration-1000 ${eventsSection.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}
        >
          <div className="flex items-end justify-between mb-16">
            <div>
              <div className="inline-block text-indigo-400 text-xs font-semibold uppercase tracking-[0.3em] mb-5 border border-indigo-500/30 rounded-full px-4 py-1.5 bg-indigo-500/5">
                Events
              </div>
              <h2 className="text-5xl md:text-6xl font-bold text-white">
                What&apos;s{' '}
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #818cf8, #67e8f9)' }}>
                  Coming
                </span>
              </h2>
            </div>
            <Link href="/events" className="group hidden md:inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              See all
              <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>

          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event, i) => (
                <div
                  key={event.id}
                  className={`transition-all duration-700 ${eventsSection.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                  style={{ transitionDelay: `${i * 120}ms` }}
                >
                  <EventCard {...event} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 text-gray-600">
              <div className="text-6xl mb-4 opacity-50">📅</div>
              <p className="text-xl text-gray-500">No upcoming events right now.</p>
              <p className="text-gray-600 mt-2 text-sm">Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* ──────────── PAST EVENTS ──────────── */}
      {completedEvents.length > 0 && (
        <section className="py-32 px-4 bg-gray-900 relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
          <div
            ref={historySection.ref}
            className={`max-w-6xl mx-auto transition-all duration-1000 ${historySection.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}
          >
            <div className="mb-16">
              <div className="inline-block text-purple-400 text-xs font-semibold uppercase tracking-[0.3em] mb-5 border border-purple-500/30 rounded-full px-4 py-1.5 bg-purple-500/5">
                History
              </div>
              <h2 className="text-5xl md:text-6xl font-bold text-white">
                Our{' '}
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #c084fc, #818cf8)' }}>
                  Events
                </span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedEvents.map((event, i) => (
                <div
                  key={event.id}
                  className={`transition-all duration-700 ${historySection.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                  style={{ transitionDelay: `${i * 120}ms` }}
                >
                  <EventCard {...event} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ──────────── CTA ──────────── */}
      <section className="py-40 px-4 relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-indigo-950/50 to-purple-950/30" />
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.08) 0%, transparent 70%)'
        }} />
        {/* Animated ring */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-indigo-500/10 rounded-full animate-spin-slow pointer-events-none" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-purple-500/10 rounded-full animate-spin-slower pointer-events-none" />

        <div
          ref={ctaSection.ref}
          className={`relative max-w-3xl mx-auto text-center transition-all duration-1000 ${ctaSection.visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        >
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Ready to{' '}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #818cf8, #c084fc, #67e8f9)' }}>
              join?
            </span>
          </h2>
          <p className="text-gray-400 text-xl mb-12 leading-relaxed">
            Signup and Stay Tuned — Or just show up.
          </p>
          <Link
            href="/events"
            className="group relative inline-flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-12 py-5 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/40 text-lg overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative">View Events</span>
            <span className="relative inline-block transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </section>
    </div>
  )
}
