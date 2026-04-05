import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/lib/i18n/request.ts')

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },
  async redirects() {
    return [
      // Legacy /tools/* URLs → root-level
      {
        source: '/tools/:slug',
        destination: '/:slug',
        permanent: true,
      },
      // Old domain redirect
      {
        source: '/',
        has: [{ type: 'host', value: 'fov-viewer.iser.io' }],
        destination: 'https://www.phototools.io/fov-simulator',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'fov-viewer.iser.io' }],
        destination: 'https://www.phototools.io/fov-simulator',
        permanent: true,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          // Privacy
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()' },

          // Security
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''} https://www.googletagmanager.com https://pagead2.googlesyndication.com https://cdn-cookieyes.com https://va.vercel-scripts.com`,
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' blob: data: https://pagead2.googlesyndication.com https://www.google.com https://googleads.g.doubleclick.net https://cdn-cookieyes.com",
              "font-src 'self'",
              "connect-src 'self' blob: https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://pagead2.googlesyndication.com https://cdn-cookieyes.com https://log.cookieyes.com",
              "frame-src 'self' https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
              "object-src 'none'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default withNextIntl(nextConfig)
