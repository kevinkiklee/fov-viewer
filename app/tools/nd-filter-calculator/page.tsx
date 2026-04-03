import type { Metadata } from 'next'
import { NdFilterCalculator } from '@/components/tools/nd-filter-calculator/NdFilterCalculator'

export const metadata: Metadata = {
  title: 'ND Filter Calculator',
  description: 'Calculate exposure time with any ND filter. Quick-reference table included.',
}

export default function NdFilterCalculatorPage() {
  return <NdFilterCalculator />
}
