'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createEvent } from '@/lib/api'

export default function NewEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ title: '', description: '', date: '', venue: '', capacity: '', cover_image_url: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await createEvent({
        title: form.title, description: form.description,
        date: new Date(form.date).toISOString(),
        venue: form.venue, capacity: parseInt(form.capacity),
        cover_image_url: form.cover_image_url || undefined
      })
      router.push('/organizer')
    } catch (err: any) {
      setError(err.message || 'Failed to create event')
      setLoading(false)
    }
  }

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/organizer" className="text-gray-400 hover:text-white transition-colors">← Back</Link>
          <h1 className="text-3xl font-bold text-white">Create New Event</h1>
        </div>
        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Event Title *</label>
              <input type="text" value={form.title} onChange={(e) => update('title', e.target.value)} required className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors" placeholder="e.g. HackFest 2024" />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Description *</label>
              <textarea value={form.description} onChange={(e) => update('description', e.target.value)} required rows={4} className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors resize-none" placeholder="Describe the event..." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Date & Time *</label>
                <input type="datetime-local" value={form.date} onChange={(e) => update('date', e.target.value)} required className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors" />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Capacity *</label>
                <input type="number" value={form.capacity} onChange={(e) => update('capacity', e.target.value)} required min="1" className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors" placeholder="e.g. 100" />
              </div>
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Venue *</label>
              <input type="text" value={form.venue} onChange={(e) => update('venue', e.target.value)} required className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors" placeholder="e.g. Main Auditorium, Block A" />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Cover Image URL <span className="text-gray-500">(optional)</span></label>
              <input type="url" value={form.cover_image_url} onChange={(e) => update('cover_image_url', e.target.value)} className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors" placeholder="https://..." />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-semibold py-4 rounded-lg transition-all duration-200 text-lg">
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
