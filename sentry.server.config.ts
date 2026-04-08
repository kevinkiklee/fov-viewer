import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
  release: process.env.VERCEL_GIT_COMMIT_SHA,

  // Capture all errors
  sampleRate: 1.0,

  // Performance: 10% in production, 1% in preview
  tracesSampleRate:
    process.env.VERCEL_ENV === 'production' ? 0.1 : 0.01,
})
