import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SmoothScroller from '@/components/SmoothScroller'
import CustomCursor from '@/components/CustomCursor'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Ahalia Overflow — Your Friendly neighbourhood IT people',
  description: "Ahalia Overflow | stay Curious. Break. Tinker. Learn.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`} style={{ background: '#06000F', color: '#fff' }}>
        <SmoothScroller>
          {/* Custom cursor — renders nothing on touch devices */}
          <CustomCursor />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </SmoothScroller>
      </body>
    </html>
  )
}
