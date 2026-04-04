import type { Metadata } from 'next'
import { DiffractionLimit } from './_components/DiffractionLimit'

export const metadata: Metadata = {
  title: 'Diffraction Limit Calculator',
  description: 'Find the sharpest aperture for your camera before diffraction softening kicks in. Enter your sensor and resolution to see the optimal f-stop.',
  openGraph: {
    images: ['/images/og/diffraction-limit.jpg'],
  },
}

export default function DiffractionLimitPage() {
  return <DiffractionLimit />
}
