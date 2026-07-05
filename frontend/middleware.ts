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
        get: (name: string) => request.cookies.get(name)?.value,
        set: (name: string, value: string, options: any) => response.cookies.set({ name, value, ...options }),
        remove: (name: string, options: any) => response.cookies.set({ name, value: '', ...options })
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
