import { type NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './lib/i18n/routing'

const intlMiddleware = createMiddleware(routing)

export default function proxy(request: NextRequest) {
  // Case-correct lowercase /zh-tw/* → /zh-TW/* for the only hyphenated locale.
  // Next.js routing is case-sensitive, so without this users hitting lowercase 404.
  const { pathname } = request.nextUrl
  if (pathname === '/zh-tw' || pathname.startsWith('/zh-tw/')) {
    const url = request.nextUrl.clone()
    url.pathname = '/zh-TW' + pathname.slice('/zh-tw'.length)
    return NextResponse.redirect(url, 308)
  }
  return intlMiddleware(request)
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
}
