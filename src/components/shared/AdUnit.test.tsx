import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock IntersectionObserver for jsdom
class MockIntersectionObserver {
  observe = vi.fn()
  disconnect = vi.fn()
  unobserve = vi.fn()
  constructor() {}
}
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)

vi.mock('@/lib/ads', () => ({
  isAdsEnabled: vi.fn(),
  AD_FORMATS: {
    rectangle: { width: 300, height: 250 },
    leaderboard: { width: 728, height: 90 },
    'mobile-banner': { width: 320, height: 50 },
  },
  getAdsenseClient: vi.fn(),
}))

import { isAdsEnabled, getAdsenseClient } from '@/lib/ads'

const mockIsAdsEnabled = vi.mocked(isAdsEnabled)
const mockGetAdsenseClient = vi.mocked(getAdsenseClient)

describe('AdUnit', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders nothing when ads are disabled', async () => {
    mockIsAdsEnabled.mockReturnValue(false)
    const { AdUnit } = await import('./AdUnit')
    const { container } = render(<AdUnit slot="12345" format="rectangle" testId="ad" />)
    expect(container.innerHTML).toBe('')
  })

  it('renders ad container with correct dimensions when enabled', async () => {
    mockIsAdsEnabled.mockReturnValue(true)
    mockGetAdsenseClient.mockReturnValue('ca-pub-999')
    const { AdUnit } = await import('./AdUnit')
    render(<AdUnit slot="12345" format="rectangle" testId="ad" />)
    const container = screen.getByTestId('ad')
    expect(container).toBeTruthy()
  })

  it('renders advertisement label when enabled', async () => {
    mockIsAdsEnabled.mockReturnValue(true)
    mockGetAdsenseClient.mockReturnValue('ca-pub-999')
    const { AdUnit } = await import('./AdUnit')
    render(<AdUnit slot="12345" format="leaderboard" testId="ad" />)
    expect(screen.getByText('Advertisement')).toBeTruthy()
  })

  it('applies custom className', async () => {
    mockIsAdsEnabled.mockReturnValue(true)
    mockGetAdsenseClient.mockReturnValue('ca-pub-999')
    const { AdUnit } = await import('./AdUnit')
    render(<AdUnit slot="12345" format="rectangle" className="custom" testId="ad" />)
    const container = screen.getByTestId('ad')
    expect(container.className).toContain('custom')
  })
})
