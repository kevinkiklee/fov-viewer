import type { Metadata } from 'next'
import { WhiteBalance } from './_components/WhiteBalance'

export const metadata: Metadata = {
  title: 'White Balance Visualizer',
  description: 'See how color temperature affects your photos.',
  openGraph: {
    images: ['/images/og/white-balance.png'],
  },
}

export default function WhiteBalancePage() {
  return <WhiteBalance />
}
