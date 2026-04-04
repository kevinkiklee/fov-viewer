import type { Metadata } from 'next'
import { SensorSize } from './_components/SensorSize'

export const metadata: Metadata = {
  title: 'Sensor Size Comparison',
  description: 'Compare camera sensor sizes from medium format to smartphone. See overlay, side-by-side, and pixel density views with real camera models.',
}

export default function SensorSizePage() {
  return <SensorSize />
}
