type ProviderStatus = {
  posthog: boolean
  ga4: boolean
  meta: boolean
}

export function isDebugEnabled(): boolean {
  return process.env.NODE_ENV !== 'production'
}

export function debugLog(
  eventName: string,
  properties: Record<string, unknown>,
  providers: ProviderStatus,
): void {
  if (!isDebugEnabled()) return

  const phStatus = providers.posthog ? 'OK' : 'blocked'
  const gaStatus = providers.ga4 ? 'OK' : 'blocked'
  const metaStatus = providers.meta ? 'OK' : 'blocked'

  console.log(
    `[Analytics] ${eventName} -> PostHog ${phStatus}, GA4 ${gaStatus}, Meta ${metaStatus}`,
    properties,
  )
}
