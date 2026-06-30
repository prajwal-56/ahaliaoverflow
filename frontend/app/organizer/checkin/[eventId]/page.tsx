'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'

const QRScanner = dynamic(() => import('@/components/QRScanner'), { ssr: false })

export default function CheckinPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) { router.push('/auth/login'); return }
      const { data: profile } = await supabase.from('users').select('role').eq('id', data.user.id).single()
      if (!profile || profile.role !== 'organizer') { router.push('/dashboard'); return }
      setAuthorized(true)
      setLoading(false)
    }
    check()
  }, [router])

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!authorized) return null

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/organizer" className="text-gray-400 hover:text-white transition-colors">← Back</Link>
          <h1 className="text-2xl font-bold text-white">📷 Check-in Scanner</h1>
        </div>
        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 flex flex-col items-center">
          <p className="text-gray-400 text-sm mb-6 text-center">Point the camera at a participant&apos;s QR code to check them in.</p>
          <QRScanner />
        </div>
      </div>
    </div>
  )
}
