'use client'
import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { checkInByToken } from '@/lib/api'

export default function QRScanner() {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [result, setResult] = useState<{ status: string; message: string } | null>(null)
  const [scanning, setScanning] = useState(false)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-reader')
    scannerRef.current = scanner
    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          if (scanning) return
          scanner.pause()
          setScanning(true)
          try {
            const res = await checkInByToken(decodedText)
            setResult(res)
          } catch (e) {
            setResult({ status: 'error', message: 'Failed to check in' })
          }
          setTimeout(() => { setScanning(false); try { scanner.resume() } catch (_) {} }, 3000)
        },
        undefined
      )
      .then(() => setStarted(true))
      .catch((err) => { setResult({ status: 'error', message: `Camera error: ${err}` }) })
    return () => { scanner.stop().catch(() => {}) }
  }, [])

  const statusColor = result?.status === 'success' ? 'bg-green-600' : result?.status === 'already_checked_in' ? 'bg-yellow-500' : 'bg-red-600'

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div id="qr-reader" className="w-72 h-72 rounded-xl overflow-hidden border-2 border-indigo-500" />
      {!started && !result && <p className="text-gray-500 text-sm">Starting camera...</p>}
      {result && (
        <div className={`${statusColor} text-white px-6 py-4 rounded-xl text-center w-full max-w-sm`}>
          <p className="font-bold text-lg">{result.message}</p>
        </div>
      )}
    </div>
  )
}
