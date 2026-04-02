import { describe, it, expect, vi, beforeEach } from 'vitest'
import { copyLinkToClipboard } from './export'

describe('copyLinkToClipboard', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  it('calls clipboard.writeText with current URL', () => {
    copyLinkToClipboard()
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(window.location.href)
  })

  it('returns true on success', () => {
    expect(copyLinkToClipboard()).toBe(true)
  })

  it('returns false when clipboard throws', () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => { throw new Error('denied') }),
      },
    })
    expect(copyLinkToClipboard()).toBe(false)
  })
})
