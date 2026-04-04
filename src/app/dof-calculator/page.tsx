import type { Metadata } from 'next'
import { DoFCalculator } from './_components/DoFCalculator'

export const metadata: Metadata = {
  title: 'Depth of Field Calculator',
  description: 'Calculate depth of field for any lens, aperture, and sensor size. See near/far focus limits, hyperfocal distance, and background blur — free and interactive.',
}

export default function DoFCalculatorPage() {
  return <DoFCalculator />
}
