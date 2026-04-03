import type { Metadata } from 'next'
import { EVChart } from '@/components/tools/ev-chart/EVChart'

export const metadata: Metadata = {
  title: 'EV Chart',
  description: 'Interactive exposure value reference chart for all aperture and shutter speed combinations.',
}

export default function EVChartPage() {
  return <EVChart />
}
