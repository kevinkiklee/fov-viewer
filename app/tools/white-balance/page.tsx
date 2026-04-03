import type { Metadata } from 'next'
import { WhiteBalance } from '@/components/tools/white-balance/WhiteBalance'

export const metadata: Metadata = {
  title: 'White Balance Visualizer',
  description: 'See how color temperature affects your photos.',
}

export default function WhiteBalancePage() {
  return <WhiteBalance />
}
