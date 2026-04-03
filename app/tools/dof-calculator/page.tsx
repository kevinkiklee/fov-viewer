import type { Metadata } from 'next'
import { DoFCalculator } from '@/components/tools/dof-calculator/DoFCalculator'

export const metadata: Metadata = {
  title: 'Depth of Field Calculator',
  description: 'Calculate near focus, far focus, and total depth of field for any lens and sensor.',
  openGraph: {
    images: ['/images/og/dof-calculator.jpg'],
  },
}

export default function DoFCalculatorPage() {
  return <DoFCalculator />
}
