import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import messages from '@/lib/i18n/messages/en/common.json'

vi.mock('@/lib/ads', () => ({
  isAdsEnabled: vi.fn(),
  AD_FORMATS: {
    rectangle: { width: 300, height: 250 },
    leaderboard: { width: 728, height: 90 },
    'mobile-banner': { width: 320, height: 50 },
  },
  getAdsenseClient: vi.fn(() => 'ca-pub-test'),
}))

import { isAdsEnabled } from '@/lib/ads'

const mockIsAdsEnabled = vi.mocked(isAdsEnabled)

const store: Record<string, string> = {}
const mockSessionStorage = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, val: string) => { store[key] = val }),
  removeItem: vi.fn((key: string) => { delete store[key] }),
  clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]) }),
  get length() { return Object.keys(store).length },
  key: vi.fn(() => null),
}

Object.defineProperty(window, 'sessionStorage', { value: mockSessionStorage })

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}

describe('MobileAdBanner', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mockSessionStorage.clear()
  })

  it('renders nothing when ads are disabled', async () => {
    mockIsAdsEnabled.mockReturnValue(false)
    const { MobileAdBanner } = await import('./MobileAdBanner')
    const { container } = render(<MobileAdBanner />, { wrapper: Wrapper })
    expect(container.innerHTML).toBe('')
  })

  it('renders nothing when previously dismissed', async () => {
    mockIsAdsEnabled.mockReturnValue(true)
    store['phototools-ad-dismissed'] = '1'
    const { MobileAdBanner } = await import('./MobileAdBanner')
    const { container } = render(<MobileAdBanner />, { wrapper: Wrapper })
    expect(container.innerHTML).toBe('')
  })

  it('renders banner when enabled and not dismissed', async () => {
    mockIsAdsEnabled.mockReturnValue(true)
    const { MobileAdBanner } = await import('./MobileAdBanner')
    render(<MobileAdBanner />, { wrapper: Wrapper })
    expect(screen.getByLabelText('Close advertisement')).toBeTruthy()
  })

  it('dismisses on close button click', async () => {
    mockIsAdsEnabled.mockReturnValue(true)
    const { MobileAdBanner } = await import('./MobileAdBanner')
    render(<MobileAdBanner />, { wrapper: Wrapper })
    fireEvent.click(screen.getByLabelText('Close advertisement'))
    expect(mockSessionStorage.setItem).toHaveBeenCalledWith('phototools-ad-dismissed', '1')
  })
})
