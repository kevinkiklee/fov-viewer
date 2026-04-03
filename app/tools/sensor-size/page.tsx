import type { Metadata } from 'next'
import { SensorSize } from '@/components/tools/sensor-size/SensorSize'

export const metadata: Metadata = {
  title: 'Sensor Size Comparison',
  description: 'Compare camera sensor sizes visually with an interactive overlay.',
  openGraph: {
    images: ['/images/og/sensor-size.jpg'],
  },
}

export default function SensorSizePage() {
  return <SensorSize />
}
