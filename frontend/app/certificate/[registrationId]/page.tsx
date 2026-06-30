'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getCertificate } from '@/lib/api'

export default function CertificatePage() {
  const { registrationId } = useParams<{ registrationId: string }>()
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCertificate(registrationId)
      .then((url) => { setBlobUrl(url); setLoading(false) })
      .catch((err) => { setError(err.message); setLoading(false) })
  }, [registrationId])

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Generating your certificate...</p>
      </div>
    </div>
  )

  if (error) {
    const isEligibility = error.includes('attended') || error.includes('checked in')
    const isAuth = error.includes('401') || error.includes('log in') || error.includes('token')
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">{isAuth ? '🔒' : '🎫'}</div>
          <h2 className="text-2xl font-bold text-white mb-4">{isAuth ? 'Please log in' : 'Certificate not available'}</h2>
          <p className="text-gray-400 mb-8">{isAuth ? 'You need to be logged in to view your certificate.' : 'Certificate not available — you need to have attended this event.'}</p>
          {isAuth ? (
            <Link href="/auth/login" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-lg transition-all">Log In</Link>
          ) : (
            <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-300 font-medium">← Back to Dashboard</Link>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-4xl w-full text-center">
        <div className="text-indigo-400 text-sm font-medium uppercase tracking-widest mb-4">Achievement Unlocked</div>
        <h1 className="text-4xl font-bold text-white mb-8">🏆 Your Certificate</h1>
        {blobUrl && (
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-indigo-600/10 rounded-2xl blur-2xl" />
            <img src={blobUrl} alt="Certificate of Participation" className="relative w-full rounded-2xl border border-gray-700 shadow-2xl" />
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href={blobUrl!} download="certificate.png" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 rounded-lg transition-all duration-200 hover:scale-105">
            📥 Download Certificate
          </a>
          <Link href="/dashboard" className="border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white font-semibold px-8 py-4 rounded-lg transition-all duration-200">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
