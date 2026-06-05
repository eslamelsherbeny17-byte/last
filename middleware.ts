import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  // 🎯 التعديل الجذري: شلنا /cart و /checkout عشان الموبايل ميطردكش
  const protectedRoutes = ['/profile']
  const adminRoutes = ['/admin']

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))
  const isAdminLoginPage = pathname === '/admin/login'

  // أدمن: لو مفيش توكن روح admin/login
  if (isAdminRoute && !token && !isAdminLoginPage) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // مستخدم: لو route محمية ومفيش توكن روح login
  if (isProtectedRoute && !token) {
    const url = new URL('/login', request.url)
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  // 🎯 التعديل الجذري: مسحنا المسارات بتاعت الدفع من المراقبة
  matcher: [
    '/profile/:path*',
    '/admin/:path*',
  ],
}