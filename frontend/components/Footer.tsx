'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

const COMMAND_RESPONSES: Record<string, string> = {
  '/help': 'AVAILABLE COMMANDS: /about, /events, /tinker, /ping, /prajwal, /donate, /organize, /clear',
  '/about': 'AHALIA OVERFLOW: A COLLECTIVE OF RAW NERDS. BREAK, TINKER, LEARN.',
  '/events': 'UPCOMING: DEV WORKSHOPS, RETRO GAME HACKATHONS. CHECK ALL EVENTS PAGE.',
  '/tinker': 'SYSTEM OVERFLOW STATUS: 100% CAPACITY. CURRENT TEMPERATURE: IDEAL.',
  '/ping': 'PONG! SYSTEM LATENCY: 9MS. YOU ARE ONLINE.',
  '/prajwal': 'CREATOR: PRAJWAL (PORTFOLIO: https://prajwal-56.github.io)',
  '/donate': 'SUPPORT THE DEVELOPER: https://prajwal-56.github.io/donate',
  '/organize': 'WANT TO ORGANIZE EVENTS? EMAIL DETAILS TO prawmathean@proton.me FOR ACCESS.',
}

export default function Footer() {
  const [input, setInput] = useState('')
  const [terminalLines, setTerminalLines] = useState<string[]>([
    'AHALIA OVERFLOW [VERSION 2.0.4]',
    'ENTER /help TO VIEW AVAILABLE TECH COMMANDS.',
  ])
  const terminalEndRef = useRef<HTMLDivElement>(null)

  const isInitialMount = useRef(true)

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [terminalLines])

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault()
    const cmd = input.trim().toLowerCase()
    if (!cmd) return

    let response = `COMMAND NOT FOUND: ${cmd}. ENTER /help FOR COMMANDS.`
    if (cmd === '/clear') {
      setTerminalLines([])
      setInput('')
      return
    }

    if (COMMAND_RESPONSES[cmd]) {
      response = COMMAND_RESPONSES[cmd]
    }

    setTerminalLines((prev) => [...prev, `> ${input}`, response])
    setInput('')
  }

  return (
    <footer className="relative py-20 px-4 overflow-hidden border-t font-mono"
      style={{ background: 'rgba(4,0,10,0.98)', borderColor: 'rgba(200,255,0,0.12)' }}>
      
      {/* Interactive Grid Line Background */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(200,255,0,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(200,255,0,0.15) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      <div className="max-w-6xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Brand column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="text-xl font-bold uppercase tracking-widest text-white">
            <span className="text-[#C8FF00] animate-pulse">⚡</span> AHALIA <span className="text-[#C8FF00]">OVERFLOW</span>
          </div>
          <p className="text-gray-500 text-xs uppercase tracking-wider leading-relaxed max-w-sm">
            stay curious. break.{' '}
            <a href="https://instagram.com/tinkerhub.aset" target="_blank" rel="noopener noreferrer" className="text-[#C8FF00] hover:underline underline-offset-2">
              tinker
            </a>
            . learn. no rules, just code.
          </p>

          <div className="flex gap-3">
            {['github', 'instagram'].map((platform) => {
              const url = platform === 'github' ? 'https://github.com/prajwal-56/ahaliaoverflow' : 'https://instagram.com/tinkerhub.aset'
              return (
                <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                  className="px-4 py-2 border rounded-xl text-xs uppercase tracking-wider text-gray-400 hover:text-[#C8FF00] transition-all hover:scale-105"
                  style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                  {platform}
                </a>
              )
            })}
          </div>
        </div>

        {/* Links */}
        <div className="lg:col-span-3 space-y-4">
          <h3 className="text-[10px] uppercase tracking-[0.25em] text-white opacity-70">Navigation</h3>
          <ul className="space-y-3 text-xs uppercase">
            {['Home', 'Events', 'Dashboard', 'Log In'].map((n) => {
              const url = n === 'Home' ? '/' : n === 'Log In' ? '/auth/login' : `/${n.toLowerCase()}`
              return (
                <li key={n}>
                  <Link href={url} className="text-gray-500 hover:text-white transition-colors flex items-center gap-2">
                    <span className="text-[#C8FF00]">▸</span> {n}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        {/* INTERACTIVE TERMINAL FOOTER PANEL */}
        <div className="lg:col-span-5 w-full">
          <div className="rounded-xl border overflow-hidden shadow-2xl"
            style={{ borderColor: 'rgba(200,255,0,0.2)', background: 'rgba(6,0,15,0.8)', boxShadow: '0 0 30px rgba(200,255,0,0.03)' }}>
            
            {/* Terminal Header */}
            <div className="px-4 py-2 flex items-center justify-between border-b"
              style={{ borderColor: 'rgba(200,255,0,0.1)', background: 'rgba(200,255,0,0.02)' }}>
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF2D78]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#C8FF00]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF]" />
              </div>
              <span className="text-[10px] uppercase text-[#C8FF00]/80 tracking-wider">sh - interactive terminal</span>
            </div>

            {/* Terminal Output */}
            <div className="p-4 h-36 overflow-y-auto text-xs space-y-2 scrollbar-none" style={{ color: 'rgba(200,255,0,0.85)' }}>
              {terminalLines.map((line, idx) => (
                <div key={idx} className="whitespace-pre-wrap leading-relaxed">
                  {line}
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>

            {/* Terminal Input */}
            <form onSubmit={handleCommand} className="flex border-t" style={{ borderColor: 'rgba(200,255,0,0.1)' }}>
              <span className="pl-4 py-3 text-xs text-[#C8FF00]/80">{'>'}</span>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="type command..."
                className="w-full bg-transparent border-none text-xs px-2 py-3 text-[#C8FF00] focus:outline-none placeholder-[#C8FF00]/30 font-mono"
              />
              <button type="submit" className="px-4 text-xs font-bold uppercase tracking-wider text-black bg-[#C8FF00]">
                RUN
              </button>
            </form>
          </div>
        </div>

      </div>

      <div className="mt-16 pt-8 border-t text-center text-[10px] uppercase tracking-wider"
        style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}>
        © {new Date().getFullYear()} Ahalia Overflow. Built with curiosity.
      </div>
    </footer>
  )
}
