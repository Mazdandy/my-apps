import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/session'

const protectedPrefixes = ['/dashboard', '/admin', '/invitations']

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname

  const isProtected = protectedPrefixes.some((p) => path.startsWith(p))
  if (!isProtected) return NextResponse.next()

  const session = await decrypt(request.cookies.get('session')?.value)

  if (!session?.userId) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Admins cannot access the user dashboard
  if (path.startsWith('/dashboard') && session.role !== 'USER') {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // Users cannot access the admin console
  if (path.startsWith('/admin') && session.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/invitations/:path*'],
}
