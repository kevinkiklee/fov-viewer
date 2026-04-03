import type { Metadata } from 'next'
import { ExposureSimulator } from '@/components/tools/exposure-simulator/ExposureSimulator'

export const metadata: Metadata = {
  title: 'Exposure Triangle Simulator',
  description: 'See how aperture, shutter speed, and ISO interact to control exposure.',
  openGraph: {
    images: ['/images/og/exposure-simulator.jpg'],
  },
}

export default function ExposureSimulatorPage() {
  return <ExposureSimulator />
}
