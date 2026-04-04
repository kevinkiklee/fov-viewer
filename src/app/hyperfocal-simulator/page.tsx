import type { Metadata } from 'next'
import { HyperfocalSimulator } from './_components/HyperfocalSimulator'

export const metadata: Metadata = {
  title: 'Hyperfocal Distance Simulator',
  description: 'Visualize hyperfocal distance for any lens and sensor. See exactly where to focus for maximum sharpness from foreground to infinity.',
}

export default function HyperfocalSimulatorPage() {
  return <HyperfocalSimulator />
}
