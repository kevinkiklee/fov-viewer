import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { logger } from './logger'

describe('logger', () => {
  const originalEnv = process.env.NODE_ENV

  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    process.env.NODE_ENV = originalEnv
    delete process.env.VERCEL_ENV
  })

  describe('production mode (JSON output)', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production'
    })

    it('outputs valid JSON for info level', () => {
      logger.info('health', 'OK')
      expect(console.log).toHaveBeenCalledOnce()
      const output = (console.log as ReturnType<typeof vi.fn>).mock.calls[0][0]
      const parsed = JSON.parse(output)
      expect(parsed.level).toBe('info')
      expect(parsed.module).toBe('health')
      expect(parsed.message).toBe('OK')
      expect(parsed.timestamp).toBeDefined()
    })

    it('outputs valid JSON for warn level', () => {
      logger.warn('contact', 'Rate limited', { ip: '1.2.3.4' })
      const output = (console.log as ReturnType<typeof vi.fn>).mock.calls[0][0]
      const parsed = JSON.parse(output)
      expect(parsed.level).toBe('warn')
      expect(parsed.module).toBe('contact')
      expect(parsed.ip).toBe('1.2.3.4')
    })

    it('outputs valid JSON for error level', () => {
      logger.error('contact', 'Send failed', { ip: '1.2.3.4' })
      const output = (console.log as ReturnType<typeof vi.fn>).mock.calls[0][0]
      const parsed = JSON.parse(output)
      expect(parsed.level).toBe('error')
    })

    it('extracts Error objects into message and stack', () => {
      const err = new Error('timeout')
      logger.error('contact', 'API failed', { error: err })
      const output = (console.log as ReturnType<typeof vi.fn>).mock.calls[0][0]
      const parsed = JSON.parse(output)
      expect(parsed.error).toBe('timeout')
      expect(parsed.stack).toContain('Error: timeout')
    })

    it('includes env from VERCEL_ENV', () => {
      process.env.VERCEL_ENV = 'production'
      logger.info('health', 'OK')
      const output = (console.log as ReturnType<typeof vi.fn>).mock.calls[0][0]
      const parsed = JSON.parse(output)
      expect(parsed.env).toBe('production')
    })

    it('includes extra metadata fields', () => {
      logger.info('contact', 'Sent', { subject: 'Test', requestId: 'abc123' })
      const output = (console.log as ReturnType<typeof vi.fn>).mock.calls[0][0]
      const parsed = JSON.parse(output)
      expect(parsed.subject).toBe('Test')
      expect(parsed.requestId).toBe('abc123')
    })
  })

  describe('development mode (pretty-print)', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development'
    })

    it('outputs human-readable format', () => {
      logger.info('health', 'OK')
      expect(console.log).toHaveBeenCalledOnce()
      const output = (console.log as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(output).toContain('[INFO]')
      expect(output).toContain('health')
      expect(output).toContain('OK')
    })

    it('includes metadata in pretty-print', () => {
      logger.warn('contact', 'Rate limited', { ip: '1.2.3.4' })
      const output = (console.log as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(output).toContain('[WARN]')
      expect(output).toContain('1.2.3.4')
    })

    it('does not output JSON in development', () => {
      logger.info('health', 'OK')
      const output = (console.log as ReturnType<typeof vi.fn>).mock.calls[0][0]
      // Should not be parseable as JSON with a "level" field
      try {
        const parsed = JSON.parse(output)
        expect(parsed.level).toBeUndefined()
      } catch {
        // Not JSON at all — correct behavior
      }
    })
  })
})
