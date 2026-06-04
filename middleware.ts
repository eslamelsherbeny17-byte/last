import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  const protectedRoutes = ['/profile', '/cart', '/checkout']
  const adminRoutes = ['/admin']

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))
  const isAdminLoginPage = pathname === '/admin/login'

  // أدمن: لو مفيش توكن روح admin/login
  if (isAdminRoute && !token && !isAdminLoginPage) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // مستخدم: لو route محمية ومفيش توكن روح login + callbackUrl
  if (isProtectedRoute && !token) {
    const url = new URL('/login', request.url)
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/profile/:path*',
    '/cart',
    '/checkout',
    '/admin/:path*',
  ],
}