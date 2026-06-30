import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options) => response.cookies.set({ name, value, ...options }),
        remove: (name, options) => response.cookies.set({ name, value: '', ...options })
      }
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  const protectedPaths = ['/dashboard', '/organizer', '/certificate']
  const isProtected = protectedPaths.some(p => request.nextUrl.pathname.startsWith(p))

  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/organizer/:path*', '/certificate/:path*']
}
