import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import bundleAnalyzer from '@next/bundle-analyzer'
import { withSentryConfig } from '@sentry/nextjs'
import { staticRedirects } from './src/lib/i18n/redirects'

const withNextIntl = createNextIntlPlugin('./src/lib/i18n/request.ts')
const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },
  async redirects() {
    return staticRedirects
  },
  async rewrites() {
    return [
      { source: '/phog/ingest/:path*', destination: 'https://eu.i.posthog.com/:path*' },
      { source: '/phog/assets/:path*', destination: 'https://eu-assets.i.posthog.com/:path*' },
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
              `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''} https://www.googletagmanager.com https://pagead2.googlesyndication.com https://cdn-cookieyes.com https://va.vercel-scripts.com https://eu-assets.i.posthog.com https://connect.facebook.net`,
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' blob: data: https://pagead2.googlesyndication.com https://www.google.com https://googleads.g.doubleclick.net https://cdn-cookieyes.com https://www.facebook.com",
              "font-src 'self'",
              "connect-src 'self' blob: https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://pagead2.googlesyndication.com https://cdn-cookieyes.com https://log.cookieyes.com https://eu.i.posthog.com https://www.facebook.com",
              "frame-src 'self' https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com https://www.facebook.com",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
              "worker-src 'self' blob:",
              "object-src 'none'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default withSentryConfig(withBundleAnalyzer(withNextIntl(nextConfig)), {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Route browser Sentry events through our server (bypasses ad blockers)
  tunnelRoute: '/monitoring',

  // Suppress source map upload logs except in CI
  silent: !process.env.CI,

  // Delete source maps after upload so browsers can't access them
  sourcemaps: {
    filesToDeleteAfterUpload: ['.next/static/**/*.map'],
  },
})
