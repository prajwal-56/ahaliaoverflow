'use client'

import { useEffect, useState } from 'react'
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

export default function HomePage() {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [completedEvents, setCompletedEvents] = useState<Event[]>([])
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    getEvents('upcoming').then((data) => setUpcomingEvents(Array.isArray(data) ? data.slice(0, 3) : []))
    getEvents('completed').then((data) => setCompletedEvents(Array.isArray(data) ? data.slice(0, 3) : []))
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600"
            alt="Technology background"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-indigo-950/80 to-gray-950" />
        </div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          {/* { <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-4 py-2 mb-8 text-indigo-300 text-sm font-medium">
            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></span>
            Your College Tech Community
            
          </div> } */}
          <h1 className="font-serif text-6xl md:text-8xl font-bold text-white mb-6 leading-tight">
            Ahalia <span className="text-indigo-400">Overflow</span>
          </h1>
          <p className="text-xl md:text-2xl text-indigo-400 font-mono mb-12 max-w-2xl mx-auto leading-relaxed">
            &gt; stay Curious. Break. <a href="https://www.instagram.com/tinkerhub.aset">Tinker.</a> Learn.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/events" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/25">
              Explore Events
            </Link>
            {user ? (
              <Link href="/dashboard" className="border border-indigo-500/50 hover:border-indigo-400 text-indigo-300 hover:text-white font-semibold px-8 py-4 rounded-lg transition-all duration-200 hover:bg-indigo-500/10">
                Go to Dashboard
              </Link>
            ) : (
              <Link href="/auth/signup" className="border border-indigo-500/50 hover:border-indigo-400 text-indigo-300 hover:text-white font-semibold px-8 py-4 rounded-lg transition-all duration-200 hover:bg-indigo-500/10">
                Join the Overflow
              </Link>
            )}
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500">
          <span className="text-xs">Scroll to explore</span>
          <div className="w-px h-8 bg-gradient-to-b from-gray-500 to-transparent animate-bounce" />
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-24 px-4 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-indigo-400 text-sm font-medium uppercase tracking-widest mb-4">About Us</div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">Who We Are</h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Ahalia Overflow isn&apos;t a formal club. There&apos;s no structure or hierarchies. It&apos;s just a collection of raw and unfiltered versions of students who are inherently curious or want to be.
              </p>
              <p className="text-gray-400 leading-relaxed mb-4">
                It&apos;s made by people who wants to do nerdy stuffs for the people who want to do nerdy stuffs
              </p>
              <p className="text-gray-400 leading-relaxed">
                There are no commitments or requirements — just show up.
              </p>
              <div className="flex gap-4 mt-8">
                <Link href="/events" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                  View our events →
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-600/20 rounded-2xl blur-2xl" />
              <Image
                src="/richard_feynnman.jpg"
                alt="Study hard what interests you the most in the most undisciplined, irreverent and original manner possible"
                width={600}
                height={400}
                className="relative rounded-2xl object-cover w-full border border-gray-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-24 px-4 bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="text-indigo-400 text-sm font-medium uppercase tracking-widest mb-4">Events</div>
              <h2 className="text-4xl md:text-5xl font-bold text-white">What&apos;s Coming</h2>
            </div>
            <Link href="/events" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors hidden md:block">
              See all events →
            </Link>
          </div>
          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} {...event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500">
              <div className="text-5xl mb-4">📅</div>
              <p className="text-xl">No upcoming events right now.</p>
              <p className="text-gray-600 mt-2">Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {completedEvents.length > 0 && (
        <section className="py-24 px-4 bg-gray-900">
          <div className="max-w-6xl mx-auto">
            <div className="mb-12">
              <div className="text-indigo-400 text-sm font-medium uppercase tracking-widest mb-4">History</div>
              <h2 className="text-4xl md:text-5xl font-bold text-white">Our Events</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedEvents.map((event) => (
                <EventCard key={event.id} {...event} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Stats Bar */}
      {/* <section className="py-20 px-4 bg-indigo-950/30 border-y border-indigo-900/30">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { number: '12+', label: 'Events Hosted' },
              { number: '400+', label: 'Participants' },
              { number: '3', label: 'Years Running' },
            ].map((stat) => (
              <div key={stat.label} className="group">
                <div className="text-5xl md:text-6xl font-bold text-indigo-400 mb-2 group-hover:scale-110 transition-transform duration-200">{stat.number}</div>
                <div className="text-gray-400 text-lg font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA Banner */}
      <section className="py-24 px-4 bg-gradient-to-r from-indigo-950 via-purple-950 to-indigo-950">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to join?</h2>
          <p className="text-gray-300 text-xl mb-8 leading-relaxed">
            Signup and Stay Tuned — Or just show up.
          </p>
          <Link href="/events" className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-10 py-4 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/30">
            View Events
          </Link>
        </div>
      </section>
    </div>
  )
}
