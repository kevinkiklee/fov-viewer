import type { JsErrorEvent, WebGLErrorEvent, CapabilityCheckEvent } from './types'

const ANALYTICS_PATTERNS = ['/phog/', 'posthog', 'facebook', 'fbq', 'googletagmanager', 'google-analytics']

export function isAnalyticsError(source: string): boolean {
  const lower = source.toLowerCase()
  return ANALYTICS_PATTERNS.some((pattern) => lower.includes(pattern))
}

let isTrackingError = false

export function setupGlobalErrorHandlers(
  dispatch: (name: string, properties: Record<string, unknown>) => void,
): () => void {
  function handleError(event: ErrorEvent) {
    if (isTrackingError) return
    const source = event.filename || ''
    if (isAnalyticsError(source)) return

    isTrackingError = true
    try {
      dispatch('js_error', {
        message: event.message || 'Unknown error',
        source: event.filename,
        line: event.lineno,
        column: event.colno,
      })
    } finally {
      isTrackingError = false
    }
  }

  function handleRejection(event: PromiseRejectionEvent) {
    if (isTrackingError) return
    const message = event.reason?.message || event.reason?.toString() || 'Unhandled rejection'
    const source = event.reason?.stack?.split('\n')[1] || ''
    if (isAnalyticsError(source)) return

    isTrackingError = true
    try {
      dispatch('js_error', { message, source })
    } finally {
      isTrackingError = false
    }
  }

  window.addEventListener('error', handleError)
  window.addEventListener('unhandledrejection', handleRejection)

  return () => {
    window.removeEventListener('error', handleError)
    window.removeEventListener('unhandledrejection', handleRejection)
  }
}

export function trackJsError(props: JsErrorEvent) {
  return { name: 'js_error' as const, properties: props }
}

export function trackWebGLError(props: WebGLErrorEvent) {
  return { name: 'webgl_error' as const, properties: props }
}

export function trackCapabilityCheck(props: CapabilityCheckEvent) {
  return { name: 'capability_check' as const, properties: props }
}
