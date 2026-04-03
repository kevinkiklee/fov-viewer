import type { Metadata } from 'next'
import { SensorSize } from './_components/SensorSize'

export const metadata: Metadata = {
  title: 'Sensor Size Comparison',
  description: 'Compare camera sensor sizes visually with an interactive overlay.',
  openGraph: {
    images: ['/images/og/sensor-size.png'],
  },
}

export default function SensorSizePage() {
  return <SensorSize />
}
