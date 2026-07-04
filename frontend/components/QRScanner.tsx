'use client'
import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { checkInByToken } from '@/lib/api'

export default function QRScanner() {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [result, setResult] = useState<{ status: string; message: string } | null>(null)
  const [scanning, setScanning] = useState(false)
  const scanningRef = useRef(false)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    let isMounted = true
    let scanner: Html5Qrcode | null = null

    // Delay initialization slightly to prevent React 18 Strict Mode double-mount collision
    const timer = setTimeout(() => {
      if (!isMounted) return

      try {
        scanner = new Html5Qrcode('qr-reader')
        scannerRef.current = scanner

        scanner
          .start(
            { facingMode: 'environment' },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            async (decodedText) => {
              if (!isMounted || scanningRef.current) return
              scanningRef.current = true
              setScanning(true)

              // Pause scanning using the scanner reference directly
              try {
                if (scanner?.isScanning) {
                  scanner.pause(true)
                }
              } catch (e) {
                console.error('Failed to pause scanner:', e)
              }

              try {
                const res = await checkInByToken(decodedText)
                if (isMounted) setResult(res)
              } catch (e) {
                if (isMounted) setResult({ status: 'error', message: 'Failed to check in' })
              }

              // Resume scanning after 3 seconds
              setTimeout(() => {
                if (isMounted) {
                  scanningRef.current = false
                  setScanning(false)
                  try {
                    if (scanner?.isScanning) {
                      scanner.resume()
                    }
                  } catch (e) {
                    console.error('Failed to resume scanner:', e)
                  }
                }
              }, 3000)
            },
            () => {} // Silent verbosity callback
          )
          .then(() => {
            if (isMounted) {
              setStarted(true)
            } else {
              // Component unmounted while starting, stop it immediately
              if (scanner?.isScanning) {
                scanner.stop().catch(err => console.error('Cleanup stop error:', err))
              }
            }
          })
          .catch((err) => {
            if (isMounted) {
              setResult({ status: 'error', message: `Camera error: ${err}` })
            }
          })
      } catch (err) {
        console.error('Scanner creation error:', err)
      }
    }, 150)

    return () => {
      isMounted = false
      clearTimeout(timer)
      if (scanner) {
        if (scanner.isScanning) {
          scanner.stop().catch((err) => console.error('Unmount stop error:', err))
        }
      }
    }
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
