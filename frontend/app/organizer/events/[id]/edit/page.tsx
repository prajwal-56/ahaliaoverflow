'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { getEvent, updateEvent, uploadEventImage } from '@/lib/api'

export default function EditEventPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    venue: '',
    capacity: '',
    cover_image_url: '',
    host_organizer: 'independent',
    custom_host_organizer: '',
    status: 'upcoming'
  })

  useEffect(() => {
    getEvent(id)
      .then((data) => {
        const localDate = data.date ? data.date.slice(0, 16) : ''
        const standardOrganizers = ['independent', 'IEEE', 'IEDC', 'TinkerHub']
        const isCustom = !standardOrganizers.includes(data.host_organizer || 'independent')

        setForm({
          title: data.title || '',
          description: data.description || '',
          date: localDate,
          venue: data.venue || '',
          capacity: data.capacity?.toString() || '',
          cover_image_url: data.cover_image_url || '',
          host_organizer: isCustom ? 'custom' : (data.host_organizer || 'independent'),
          custom_host_organizer: isCustom ? (data.host_organizer || '') : '',
          status: data.status || 'upcoming'
        })
        setLoading(false)
      })
      .catch((err) => {
        setError('Failed to load event data.')
        setLoading(false)
      })
  }, [id])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUploading(true)
    setError('')
    
    const formData = new FormData()
    formData.append('file', file)

    try {
      const result = await uploadEventImage(formData)
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const relativeUrl = result.url.startsWith('/') ? result.url : `/${result.url}`
      update('cover_image_url', `${backendUrl}${relativeUrl}`)
    } catch (err: any) {
      setError(err.message || 'Image upload failed. Make sure backend is running.')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await updateEvent(id, {
        title: form.title,
        description: form.description,
        date: form.date ? new Date(form.date).toISOString() : undefined,
        venue: form.venue,
        capacity: parseInt(form.capacity),
        cover_image_url: form.cover_image_url || undefined,
        host_organizer: form.host_organizer === 'custom' ? form.custom_host_organizer : form.host_organizer,
        status: form.status
      })
      router.push('/organizer')
    } catch (err: any) {
      setError(err.message || 'Failed to update event')
      setSaving(false)
    }
  }

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/organizer" className="text-gray-400 hover:text-white transition-colors">← Back</Link>
          <h1 className="text-3xl font-bold text-white">Edit Event</h1>
        </div>
        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Event Title *</label>
                <input type="text" value={form.title} onChange={(e) => update('title', e.target.value)} required className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors" />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Host Organizer *</label>
                <select value={form.host_organizer} onChange={(e) => update('host_organizer', e.target.value)} className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors">
                  <option value="independent">Independent</option>
                  <option value="IEEE">IEEE Student Branch</option>
                  <option value="IEDC">IEDC</option>
                  <option value="TinkerHub">TinkerHub</option>
                  <option value="custom">Custom...</option>
                </select>
                {form.host_organizer === 'custom' && (
                  <input
                    type="text"
                    value={form.custom_host_organizer}
                    onChange={(e) => update('custom_host_organizer', e.target.value)}
                    required
                    className="w-full mt-3 bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                    placeholder="Enter custom organizer name..."
                  />
                )}
              </div>
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Description *</label>
              <textarea value={form.description} onChange={(e) => update('description', e.target.value)} required rows={4} className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors resize-none" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Date & Time</label>
                <input type="datetime-local" value={form.date} onChange={(e) => update('date', e.target.value)} className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors" />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Capacity *</label>
                <input type="number" value={form.capacity} onChange={(e) => update('capacity', e.target.value)} required min="1" className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors" />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Status *</label>
                <select value={form.status} onChange={(e) => update('status', e.target.value)} className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors">
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Venue *</label>
              <input type="text" value={form.venue} onChange={(e) => update('venue', e.target.value)} required className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors" />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Cover Image</label>
              <div className="flex gap-4 items-center">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  {uploading ? 'Uploading...' : '📁 Upload Local Image'}
                </button>
                <span className="text-gray-500 text-sm">or</span>
                <input
                  type="url"
                  value={form.cover_image_url}
                  onChange={(e) => update('cover_image_url', e.target.value)}
                  className="flex-1 bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                  placeholder="Paste cover image URL here..."
                />
              </div>
              {form.cover_image_url && (
                <div className="mt-4 relative w-full h-40 rounded-lg overflow-hidden border border-gray-700">
                  <img src={form.cover_image_url} alt="Cover Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <button type="submit" disabled={saving || uploading} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-semibold py-4 rounded-lg transition-all duration-200 text-lg">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
