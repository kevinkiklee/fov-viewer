# Observability, Monitoring & Debugging Design

**Date:** 2026-04-07
**Status:** Approved
**Approach:** Structured Observability Layer (Option B)

## Overview

Add production-grade observability to PhotoTools.io using three free-tier services: **Sentry** (error tracking), **Axiom** (log aggregation), and **BetterStack** (uptime monitoring). Includes a structured server-side logger, alert routing to email + Discord, and a health check endpoint.

**Goals:**
- See what's breaking in production without relying on user reports
- Get alerted immediately when the site goes down or API fails
- Search and filter server logs for post-incident investigation
- Enrich errors with tool/locale/session context for faster debugging

**Non-goals (deferred):**
- Custom WebGL/Canvas breadcrumbs (add later if error reports lack context)
- PostHog session replay ↔ Sentry linking
- Custom Web Vitals reporting per tool/locale
- Synthetic monitoring (Checkly)
- Debug panel for dev/QA
- Status page

## Service Architecture

```
+------------------------------------------------------+
|                    PhotoTools.io                       |
|                                                        |
|  Client (browser)                                      |
|    +-> Sentry SDK --> Sentry (errors + perf)           |
|         - enriched with tool slug, locale, session     |
|         - source maps uploaded at build time            |
|         - tagged with git SHA + environment             |
|         - tunnel via /api/sentry (bypasses ad blockers) |
|                                                        |
|  Server (Vercel Functions)                              |
|    +-> Structured logger (JSON) --> stdout              |
|         +-> Vercel Log Drain --> Axiom (searchable)     |
|    +-> Sentry SDK (server) --> Sentry (API errors)     |
|                                                        |
|  /api/health (GET) <-- BetterStack (uptime pings)      |
|  / (homepage)      <-- BetterStack (uptime pings)      |
+------------------------------------------------------+

          Alert Routing
  +---------------+-----------------+
  |   Critical     |   Non-critical   |
  | (down / 5xx)  | (spikes, new)    |
  v               v                  |
  Email +      Sentry               Axiom
  Discord     Dashboard           Dashboard
  (BetterStack) (check daily)    (search when needed)
```

**Service responsibilities:**
- **Sentry** — client-side and server-side error tracking. Auto-captures unhandled exceptions enriched with tool/locale context. Performance tracing for API routes. Alerts on error spikes and new issue types via Sentry dashboard (check-when-convenient).
- **Axiom** — receives all Vercel runtime logs via log drain (zero-code setup). The structured logger writes JSON that Axiom parses, filters, and dashboards. Server logs only — client errors go to Sentry. Investigation tool, not alerting.
- **BetterStack** — external uptime monitoring. Pings `/api/health` and homepage. On failure: email + Discord webhook (critical alerts).
- **PostHog** — unchanged. Continues handling product analytics, session replay (5K/month free), and aggregate error counts via `trackJSError`/`trackWebGLError` events.
- **Vercel Speed Insights** — unchanged. Passive CWV collection.

## Section 1: Structured Logger

Server-only logger replacing scattered `console.*` calls. Writes JSON to stdout for Axiom to parse via log drain.

### Interface

```typescript
// src/lib/logger.ts
import 'server-only'

import { logger } from '@/lib/logger'

logger.info('contact', 'Email sent', { subject: 'Feedback' })
logger.warn('contact', 'Rate limited', { ip, requestId })
logger.error('contact', 'Resend API failed', {
  ip,
  requestId,
  error: err  // logger extracts .message + .stack automatically
})
```

### Output

**Production (JSON — parsed by Axiom):**
```json
{
  "level": "error",
  "module": "contact",
  "message": "Resend API failed",
  "ip": "1.2.3.4",
  "requestId": "iad1::xxxxx",
  "error": "timeout",
  "stack": "Error: timeout\n  at ...",
  "timestamp": "2026-04-07T12:00:00Z",
  "env": "production"
}
```

**Development (pretty-print — human-readable in terminal):**
```
[ERROR] contact: Resend API failed { ip: "1.2.3.4", error: "timeout" }
```

### Design Decisions

- **3 levels only:** `info`, `warn`, `error` — matches Axiom filter vocabulary. No `debug` (use Sentry breadcrumbs for granular tracing).
- **Required `module` param:** forces a namespace on every log (`contact`, `middleware`, `health`) so Axiom queries can filter by module.
- **`import 'server-only'`:** hard build-time error if imported in a `'use client'` file.
- **Request ID support:** accepts optional `requestId` from Vercel's `x-vercel-id` header. Enables log correlation in Axiom — all logs from a single request grouped together.
- **Automatic Error extraction:** if metadata contains an Error object, extracts `.message`, `.stack`, `.name` before serializing (since `JSON.stringify(new Error())` produces `{}`).
- **`env` field auto-populated** from `VERCEL_ENV` (production/preview/development).
- **Tiny footprint:** ~30 lines, no dependencies, just JSON.stringify to stdout.
- **PII guidance:** logger does not scrub — call sites are responsible for masking sensitive fields (e.g., truncate email, don't log full request bodies).
- **Sentry separation:** logger only writes to stdout for Axiom. Errors that need Sentry get explicit `Sentry.captureException()` at the call site. No mixing responsibilities.

### Migration

Replace ~6 structured `console.*` calls in `/api/contact/route.ts` and error pages with logger calls.

## Section 2: Sentry Integration

### SDK Setup

- **Package:** `@sentry/nextjs` — covers client, server, and middleware
- **Client init:** `sentry.client.config.ts` — DSN, tunnel, sample rates, context enrichment
- **Server init:** `sentry.server.config.ts` — imported by `src/instrumentation.ts`
- **Tunnel:** `/api/sentry` route proxies events to Sentry (bypasses ad blockers that block `*.sentry.io`)
- **Source maps:** uploaded during `npm run build` via `withSentryConfig()` in `next.config.ts`
- **Release tagging:** `VERCEL_GIT_COMMIT_SHA` as release, `VERCEL_ENV` as environment

### Context Enrichment

Every error automatically includes (reuses existing analytics global properties — no duplication):
- Tool slug (which tool page the user was on)
- Locale
- Viewport type (mobile/desktop)
- Tool category (Visualizer, Calculator, etc.)

### Sample Rates (Free Tier Budget: 5K errors, 10K transactions/month)

| Setting | Production | Preview |
|---------|-----------|---------|
| Error sample rate | 1.0 (all errors) | 1.0 |
| Transaction sample rate | 0.1 | 0.01 |
| Session replay | Disabled | Disabled |

Session replay disabled — PostHog already provides 5K replays/month for free.

### What Gets Replaced

- **`error-tracking.ts`** (PostHog global error handlers) — removed. Sentry installs its own global `window.onerror` and `unhandledrejection` handlers.
- **`AnalyticsErrorBoundary.tsx`** — replaced with `Sentry.ErrorBoundary` in the same position (wrapping children in `AnalyticsProvider.tsx`). Same behavior, better Sentry integration (component stack, error grouping).
- **`initErrorTracking()` call in `AnalyticsProvider.tsx`** — removed.

### What Stays Unchanged

- **PostHog error events retained:** `trackJSError` and `trackWebGLError` event dispatchers in `src/lib/analytics/index.ts` stay. They feed PostHog dashboards for aggregate error counts per tool. Sentry handles debugging; PostHog handles trends.
- PostHog, GA4, Meta Pixel providers — untouched.
- Analytics event dispatch system — untouched.
- Analytics hooks (useToolSession, useScrollDepth) — untouched.
- WebGL/Canvas rendering code — untouched (custom breadcrumbs deferred).

### Alert Rules (Non-Critical — Sentry Dashboard Only)

- New issue first seen — Sentry notification
- Error spike (>10 events in 5 min) — Sentry notification
- Weekly email digest of unresolved issues

**Sentry does NOT send to Discord.** Discord is reserved for critical alerts (site down) via BetterStack only, keeping signal-to-noise ratio high.

### Bundle Size

`@sentry/nextjs` adds ~30-40KB gzipped to the client bundle. Acknowledged trade-off for production error visibility.

## Section 3: Health Endpoint & BetterStack Uptime

### `/api/health` Endpoint (GET)

```typescript
// Returns 200 with basic diagnostics
{
  "status": "ok",
  "timestamp": "2026-04-07T12:00:00Z",
  "version": "abc123f",  // VERCEL_GIT_COMMIT_SHA
  "env": "production"    // VERCEL_ENV
}
```

Intentionally simple — no database calls, no external service checks. Answers one question: "is the Vercel function runtime responding?"

### BetterStack Monitors (3 total, free tier: 10 available)

| Monitor | URL | Interval | Type |
|---------|-----|----------|------|
| Health endpoint | `www.phototools.io/api/health` | 3 min | HTTP status |
| Homepage | `www.phototools.io` | 3 min | HTTP status |
| Homepage keyword | `www.phototools.io` | 3 min | Keyword check for homepage-specific content (e.g., hero heading), not brand name |

**Keyword rationale:** Checking for "PhotoTools" would still pass if `error.tsx` renders (brand name is in the layout). Using a homepage-specific string like the hero heading catches deploy-broke-rendering scenarios.

### Response Time Threshold

Alert if `/api/health` response time exceeds 5 seconds. Catches degradation before full outage — site is "up" but unusably slow. Routes to email + Discord (critical).

### Alert Flow (Critical — Site Down or Degraded)

1. BetterStack detects failure (2 consecutive checks from multiple locations = ~6 min worst case)
2. Email notification
3. Discord webhook to `#phototools-alerts` channel
4. Recovery notification sent when site comes back up (explicitly enabled)

### Discord Webhook Setup

1. Create a `#phototools-alerts` channel in your Discord server
2. Channel Settings > Integrations > Webhooks > New Webhook
3. Name it "PhotoTools Alerts", copy the webhook URL
4. Add the URL to BetterStack alerting settings
5. **Note:** Once the Discord bot is set up (separate project), migrate alerts to route through the bot's channel infrastructure. The webhook approach works standalone until then.

### Triage Runbook (When You Get a "Site Down" Alert)

1. **Check Vercel dashboard** — look for failed deployments or function errors
2. **Check Axiom** — filter by timestamp window + `level:error`, look for patterns in the last 30 min
3. **Check Sentry** — look for error spike or new issue coinciding with the outage
4. **Roll back** — if a recent deploy correlates with the outage, redeploy the previous production deployment from Vercel dashboard
5. **Verify recovery** — hit `/api/health` manually, confirm BetterStack shows green

## Section 4: Axiom Log Drain & Dashboards

### Setup (Zero Code)

1. Install Axiom from Vercel Marketplace
2. Axiom auto-creates a log drain — all Vercel function stdout/stderr streams automatically
3. Structured logger writes JSON; Axiom parses fields automatically
4. **Verification:** after connecting, deploy and hit `/api/health`. Check Axiom for the log entry within 30 seconds.

### What Flows to Axiom

- All structured logger output (API routes, server components, middleware)
- Next.js build/request logs
- Vercel log drain metadata (request path, status code, duration, region, function name, HTTP method) — available automatically, even without the structured logger

### Dashboards (2 to start, manually created in Axiom UI)

**Dashboard 1: API Health**
- Request volume over time (by path)
- Error rate (level=error count / total)
- P50/P95 response duration
- Filter by module (contact, health, middleware)
- **Default filter:** `VERCEL_ENV=production` (preview deployments excluded)

**Dashboard 2: Server Overview**
- Log volume by level (info/warn/error)
- Errors by module
- Cold start frequency
- Top error messages (grouped)
- **Default filter:** `VERCEL_ENV=production`

### Investigation Workflow

When Sentry alerts you to a new error:
1. Note the timestamp and error message from Sentry
2. In Axiom: filter by timestamp window + `level:error`
3. Use `requestId` (from structured logger) to find all logs from that request
4. Check surrounding requests for patterns — same path failing? Same region?
5. Cross-reference with Sentry's error context (tool slug, locale, viewport)

### Retention

- **Axiom:** 10 days (free tier). Enough for investigating recent issues.
- **Sentry:** 30 days (free tier). Longer-term error record with stack traces and context.
- If an issue is reported after 10 days, Axiom logs are gone but Sentry still has the error + breadcrumbs.

### No Alerting from Axiom

BetterStack handles critical alerts. Sentry handles error notifications. Axiom is the investigation tool — you go there after being alerted to understand what happened.

## Section 5: CSP & Environment Variables

### CSP Changes in `next.config.ts`

**No CSP changes needed.** The Sentry tunnel (`/api/sentry`) is same-origin, so no `connect-src` additions required. The tunnel forwards to Sentry server-side where CSP doesn't apply. This also means ad blockers can't block Sentry events.

### New Environment Variables

| Variable | Scope | Where Set | Purpose |
|----------|-------|-----------|---------|
| `NEXT_PUBLIC_SENTRY_DSN` | Production + Preview | Vercel env vars | Sentry event ingestion (safe to expose publicly) |
| `SENTRY_AUTH_TOKEN` | Production + Preview | Vercel env vars | Source map upload at build time (never reaches client) |
| `SENTRY_ORG` | Production + Preview | Vercel env vars | Sentry org slug for source maps |
| `SENTRY_PROJECT` | Production + Preview | Vercel env vars | Sentry project slug for source maps |

- **Not scoped to Development** — Sentry SDK silently no-ops without a DSN, so local dev works without env vars
- **Single Sentry project** for both production and preview — separated by `environment` tag in Sentry's UI
- Axiom and BetterStack have no env vars in the codebase — configured entirely through their dashboards / Vercel Marketplace

### `.env.example` Update

Add placeholder entries for Sentry variables with comments explaining their purpose.

### Local Dev Experience

- **Sentry:** silent no-op (no DSN configured locally)
- **Logger:** pretty-prints to terminal in development, JSON in production
- **No new local services required** — all three services are external SaaS

## Section 6: File Changes

### New Files (6)

| File | Purpose |
|------|---------|
| `src/lib/logger.ts` | Structured logger (~30 lines, server-only) |
| `src/instrumentation.ts` | Sentry server-side init (imports `sentry.server.config.ts`) |
| `sentry.client.config.ts` | Sentry client-side init (DSN, tunnel, sample rates, context) |
| `sentry.server.config.ts` | Sentry server-side config (DSN, sample rates) |
| `src/app/api/sentry/route.ts` | Tunnel proxy for Sentry events (ad blocker bypass) |
| `src/app/api/health/route.ts` | Health check endpoint |

### Modified Files (~8)

| File | Change |
|------|--------|
| `next.config.ts` | Wrap with `withSentryConfig()` for source map uploads. No CSP changes. |
| `src/app/api/contact/route.ts` | Replace `console.*` calls with structured logger |
| `src/app/[locale]/error.tsx` | Add `Sentry.captureException(error)` call |
| `src/lib/analytics/error-tracking.ts` | **Remove file** — Sentry replaces PostHog global error handlers |
| `src/lib/analytics/components/AnalyticsErrorBoundary.tsx` | **Remove file** — replaced by `Sentry.ErrorBoundary` |
| `src/lib/analytics/components/AnalyticsProvider.tsx` | Remove error boundary wrapper + `initErrorTracking()` call. Add `Sentry.ErrorBoundary` wrapping children. |
| `src/lib/analytics/index.ts` | Keep `trackJSError` / `trackWebGLError` dispatchers for PostHog dashboards |
| `.env.example` | Add Sentry variable placeholders |
| `package.json` | Add `@sentry/nextjs` |

### Test Changes

| File | Change |
|------|--------|
| `src/lib/analytics/error-tracking.test.ts` | **Remove** — alongside source file |
| New: `src/lib/logger.test.ts` | Test structured output, Error serialization, dev vs prod formatting |
| New: `src/app/api/health/route.test.ts` | Test 200 response, correct JSON shape |
| New: `src/app/api/sentry/route.test.ts` | Test tunnel validates Sentry envelope payloads |
| `src/e2e/smoke/all-pages.spec.ts` | Add Sentry SDK to console error benign filter; add `/api/health` to smoke tests |
| Existing analytics tests | Update to remove error boundary references |

### Files NOT Changed

- PostHog, GA4, Meta Pixel providers
- Analytics event dispatch system (`src/lib/analytics/index.ts` — only kept, not restructured)
- Analytics hooks (useToolSession, useScrollDepth, useDebouncedTracker)
- WebGL/Canvas rendering code (custom breadcrumbs deferred)
- `.github/workflows/deploy.yml` (source maps upload via `withSentryConfig()` during `npm run build`, not a separate CI step)

### Post-Implementation

- Update CLAUDE.md test file/test count after migration
- Run `npm test` to verify all tests pass
- Run `npm run build` to verify Sentry config doesn't break the build
- Deploy to preview, verify Sentry receives a test error
- Verify Axiom receives logs via log drain
- Verify BetterStack monitors show green

## Cost

All three services on free tiers:

| Service | Free Tier Limits | Paid Trigger |
|---------|-----------------|--------------|
| Sentry | 5K errors, 10K transactions/month | Traffic spike or noisy error |
| Axiom | 500 GB ingest, 10-day retention | Would need 500GB+ logs/month |
| BetterStack | 10 monitors, 3-min intervals | Need >10 monitors or 30s intervals |

**Current expected cost: $0/month** beyond existing Vercel Pro subscription. Paid tiers only needed if PhotoTools scales significantly — which would be a good problem to have.
