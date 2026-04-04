import type { Metadata } from 'next'
import { ExposureSimulator } from './_components/ExposureSimulator'

export const metadata: Metadata = {
  title: 'Exposure Triangle Simulator',
  description: 'Interactive exposure triangle simulator — see how aperture, shutter speed, and ISO affect your image in real time with live preview.',
}

export default function ExposureSimulatorPage() {
  return <ExposureSimulator />
}
