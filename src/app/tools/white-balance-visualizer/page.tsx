import type { Metadata } from 'next'
import { WhiteBalance } from './_components/WhiteBalance'

export const metadata: Metadata = {
  title: 'White Balance Visualizer',
  description: 'See how white balance and color temperature affect your photos. Visualize changes from 2000K to 10000K with real-time preview.',
  openGraph: {
    images: ['/images/og/white-balance.png'],
  },
}

export default function WhiteBalancePage() {
  return <WhiteBalance />
}
