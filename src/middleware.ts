import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  console.log('Middleware running for path:', request.nextUrl.pathname)
  const isAuthenticated = request.cookies.get('auth')
  console.log('Auth cookie:', isAuthenticated)
  const isLoginPage = request.nextUrl.pathname === '/login'
  console.log('Is login page:', isLoginPage)

  if (isLoginPage) {
    console.log('Allowing access to login page')
    return NextResponse.next()
  }

  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  console.log('Authenticated, allowing access')
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 