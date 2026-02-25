import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getIronSession, IronSession } from 'iron-session'
import { SessionData, sessionOptions } from './lib/session'

export async function middleware(request: NextRequest) {
  try {
    const response = NextResponse.next()
    const session = await getIronSession(request, response, sessionOptions) as IronSession<SessionData>

    const isLoggedIn = session.isLoggedIn || false
    const isAdmin = session.isAdmin || false

    if (request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/admin')) {
      if (!isLoggedIn) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }

    if (request.nextUrl.pathname.startsWith('/admin')) {
      if (!isAdmin) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }



    return response
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}