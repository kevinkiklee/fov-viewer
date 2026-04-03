import type { Metadata } from 'next'
import { HyperfocalSimulator } from '@/components/tools/hyperfocal-simulator/HyperfocalSimulator'

export const metadata: Metadata = {
  title: 'Hyperfocal Distance Simulator',
  description: 'Learn where to focus for maximum sharpness from foreground to infinity.',
  openGraph: {
    images: ['/images/og/hyperfocal-simulator.jpg'],
  },
}

export default function HyperfocalSimulatorPage() {
  return <HyperfocalSimulator />
}
