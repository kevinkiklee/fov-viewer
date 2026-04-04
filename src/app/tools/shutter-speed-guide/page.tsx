import type { Metadata } from 'next'
import { ShutterSpeedGuide } from './_components/ShutterSpeedGuide'

export const metadata: Metadata = {
  title: 'Shutter Speed Guide',
  description: 'Find the minimum shutter speed for sharp handheld photos. Accounts for focal length, sensor size, and image stabilization.',
  openGraph: {
    images: ['/images/og/shutter-speed-guide.jpg'],
  },
}

export default function ShutterSpeedGuidePage() {
  return <ShutterSpeedGuide />
}
