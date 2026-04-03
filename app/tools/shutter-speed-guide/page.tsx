import type { Metadata } from 'next'
import { ShutterSpeedGuide } from '@/components/tools/shutter-speed-guide/ShutterSpeedGuide'

export const metadata: Metadata = {
  title: 'Shutter Speed Guide',
  description: 'Find the minimum safe shutter speed for sharp handheld shots with any lens.',
  openGraph: {
    images: ['/images/og/shutter-speed-guide.jpg'],
  },
}

export default function ShutterSpeedGuidePage() {
  return <ShutterSpeedGuide />
}
