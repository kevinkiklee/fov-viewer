import 'server-only'

type LogLevel = 'info' | 'warn' | 'error'

function serializeMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(metadata)) {
    if (value instanceof Error) {
      result[key] = value.message
      if (value.stack) result.stack = value.stack
    } else {
      result[key] = value
    }
  }
  return result
}

function log(level: LogLevel, module: string, message: string, metadata?: Record<string, unknown>): void {
  const serialized = metadata ? serializeMetadata(metadata) : {}

  if (process.env.NODE_ENV !== 'production') {
    const label = level.toUpperCase()
    const meta = metadata ? ` ${JSON.stringify(serialized)}` : ''
    console.log(`[${label}] ${module}: ${message}${meta}`)
    return
  }

  const entry = {
    level,
    module,
    message,
    timestamp: new Date().toISOString(),
    env: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
    ...serialized,
  }
  console.log(JSON.stringify(entry))
}

export const logger = {
  info: (module: string, message: string, metadata?: Record<string, unknown>) =>
    log('info', module, message, metadata),
  warn: (module: string, message: string, metadata?: Record<string, unknown>) =>
    log('warn', module, message, metadata),
  error: (module: string, message: string, metadata?: Record<string, unknown>) =>
    log('error', module, message, metadata),
}
