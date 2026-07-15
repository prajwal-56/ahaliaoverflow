'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createEvent, uploadEventImage, uploadUpiQrImage } from '@/lib/api'

export default function NewEventPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const upiFileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingUpi, setUploadingUpi] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isUpiDragging, setIsUpiDragging] = useState(false)
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
    is_paid: false,
    registration_fee: '',
    upi_qr_url: '',
  })

  const update = (field: string, value: string | boolean) => setForm(prev => ({ ...prev, [field]: value }))

  const handleUploadFile = async (file: File) => {
    setUploading(true)
    setError('')
    const formData = new FormData()
    formData.append('file', file)
    try {
      const result = await uploadEventImage(formData)
      update('cover_image_url', result.url)
    } catch (err: any) {
      setError(err.message || 'Cover image upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const handleUploadUpiFile = async (file: File) => {
    setUploadingUpi(true)
    setError('')
    const formData = new FormData()
    formData.append('file', file)
    try {
      const result = await uploadUpiQrImage(formData)
      update('upi_qr_url', result.url)
    } catch (err: any) {
      setError(err.message || 'UPI QR upload failed.')
    } finally {
      setUploadingUpi(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.is_paid && !form.registration_fee) {
      setError('Please enter a registration fee for paid events.')
      return
    }
    if (form.is_paid && !form.upi_qr_url) {
      setError('Please upload a UPI QR code image for paid events.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await createEvent({
        title: form.title,
        description: form.description,
        date: form.date ? new Date(form.date).toISOString() : undefined,
        venue: form.venue,
        capacity: parseInt(form.capacity),
        cover_image_url: form.cover_image_url || undefined,
        host_organizer: form.host_organizer === 'custom' ? form.custom_host_organizer : form.host_organizer,
        registration_fee: form.is_paid ? parseFloat(form.registration_fee) : 0,
        upi_qr_url: form.is_paid ? form.upi_qr_url : undefined,
      })
      router.push('/organizer')
    } catch (err: any) {
      setError(err.message || 'Failed to create event')
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"

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
            {/* Title + Organizer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Event Title *</label>
                <input type="text" value={form.title} onChange={(e) => update('title', e.target.value)} required className={inputClass} placeholder="e.g. HackFest 2024" />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Host Organizer *</label>
                <select value={form.host_organizer} onChange={(e) => update('host_organizer', e.target.value)} className={inputClass}>
                  <option value="independent">Independent</option>
                  <option value="IEEE">IEEE Student Branch</option>
                  <option value="IEDC">IEDC</option>
                  <option value="TinkerHub">TinkerHub</option>
                  <option value="custom">Custom...</option>
                </select>
                {form.host_organizer === 'custom' && (
                  <input type="text" value={form.custom_host_organizer} onChange={(e) => update('custom_host_organizer', e.target.value)} required className={`w-full mt-3 bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors text-sm`} placeholder="Enter custom organizer name..." />
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Description *</label>
              <textarea value={form.description} onChange={(e) => update('description', e.target.value)} required rows={4} className={`${inputClass} resize-none`} placeholder="Describe the event..." />
            </div>

            {/* Date + Capacity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Date & Time</label>
                <input type="datetime-local" value={form.date} onChange={(e) => update('date', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Capacity *</label>
                <input type="number" value={form.capacity} onChange={(e) => update('capacity', e.target.value)} required min="1" className={inputClass} placeholder="e.g. 100" />
              </div>
            </div>

            {/* Venue */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Venue *</label>
              <input type="text" value={form.venue} onChange={(e) => update('venue', e.target.value)} required className={inputClass} placeholder="e.g. Main Auditorium, Block A" />
            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Cover Image</label>
              <div className="space-y-4">
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={async (e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if (f) await handleUploadFile(f) }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragging ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300' : 'border-gray-700 hover:border-indigo-500/50 bg-gray-900/40 text-gray-400 hover:text-gray-300'}`}
                >
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadFile(f) }} className="hidden" />
                  <div className="text-3xl mb-2">📁</div>
                  <p className="font-medium text-sm">{uploading ? 'Uploading...' : 'Drag & drop your event cover here, or click to browse'}</p>
                  <p className="text-xs text-gray-500 mt-1">Supports PNG, JPG, JPEG, WEBP</p>
                </div>
                <div className="flex gap-4 items-center">
                  <span className="text-gray-500 text-sm">or</span>
                  <input type="url" value={form.cover_image_url} onChange={(e) => update('cover_image_url', e.target.value)} className="flex-1 bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors text-sm" placeholder="Paste external cover image URL..." />
                </div>
                {form.cover_image_url && (
                  <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-700">
                    <img src={form.cover_image_url} alt="Cover Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => update('cover_image_url', '')} className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white text-xs px-2.5 py-1.5 rounded-lg transition-colors font-semibold">Remove</button>
                  </div>
                )}
              </div>
            </div>

            {/* ──── PAYMENT SECTION ──── */}
            <div className="border border-gray-700 rounded-xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold">Registration Fee</h3>
                  <p className="text-gray-500 text-xs mt-0.5">Toggle on if this event requires a payment</p>
                </div>
                {/* Toggle Switch */}
                <button
                  type="button"
                  onClick={() => update('is_paid', !form.is_paid)}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${form.is_paid ? 'bg-indigo-600' : 'bg-gray-700'}`}
                >
                  <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${form.is_paid ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              {form.is_paid && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  {/* Fee amount */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Fee Amount (₹) *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₹</span>
                      <input
                        type="number"
                        value={form.registration_fee}
                        onChange={(e) => update('registration_fee', e.target.value)}
                        required={form.is_paid}
                        min="1"
                        step="0.01"
                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg pl-8 pr-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
                        placeholder="e.g. 100"
                      />
                    </div>
                  </div>

                  {/* UPI QR Upload */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">UPI QR Code Image *</label>
                    <p className="text-gray-500 text-xs mb-3">Upload a screenshot of your UPI QR code. This will be shown to participants when they register.</p>
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsUpiDragging(true) }}
                      onDragLeave={() => setIsUpiDragging(false)}
                      onDrop={async (e) => { e.preventDefault(); setIsUpiDragging(false); const f = e.dataTransfer.files?.[0]; if (f) await handleUploadUpiFile(f) }}
                      onClick={() => upiFileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${isUpiDragging ? 'border-green-500 bg-green-500/10 text-green-300' : 'border-gray-700 hover:border-green-500/50 bg-gray-900/40 text-gray-400 hover:text-gray-300'}`}
                    >
                      <input type="file" accept="image/*" ref={upiFileInputRef} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadUpiFile(f) }} className="hidden" />
                      <div className="text-2xl mb-2">💳</div>
                      <p className="font-medium text-sm">{uploadingUpi ? 'Uploading QR...' : 'Upload UPI QR Code (screenshot)'}</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP</p>
                    </div>

                    {form.upi_qr_url && (
                      <div className="mt-3 flex items-start gap-4">
                        <div className="relative w-36 h-36 rounded-xl overflow-hidden border border-green-600/40 bg-white flex-shrink-0">
                          <img src={form.upi_qr_url} alt="UPI QR Preview" className="w-full h-full object-contain p-1" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-green-400 text-sm font-medium mb-2">
                            <span>✅</span> QR uploaded successfully
                          </div>
                          <p className="text-gray-500 text-xs">Participants will scan this to pay before registering.</p>
                          <button type="button" onClick={() => update('upi_qr_url', '')} className="mt-3 text-xs text-red-400 hover:text-red-300 transition-colors">
                            × Remove & re-upload
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading || uploading || uploadingUpi} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-semibold py-4 rounded-lg transition-all duration-200 text-lg">
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
