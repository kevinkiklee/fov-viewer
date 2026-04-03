import type { Metadata } from 'next'
import { DiffractionLimit } from '@/components/tools/diffraction-limit/DiffractionLimit'

export const metadata: Metadata = {
  title: 'Diffraction Limit Calculator',
  description: 'Find the sharpest aperture for your sensor before diffraction softening.',
  openGraph: {
    images: ['/images/og/diffraction-limit.jpg'],
  },
}

export default function DiffractionLimitPage() {
  return <DiffractionLimit />
}
