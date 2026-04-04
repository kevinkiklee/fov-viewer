import type { Metadata } from 'next'
import { NdFilterCalculator } from './_components/NdFilterCalculator'

export const metadata: Metadata = {
  title: 'ND Filter Calculator',
  description: 'Calculate the correct shutter speed when using ND filters. Supports any filter strength from ND2 to ND1000000 with a quick-reference table.',
}

export default function NdFilterCalculatorPage() {
  return <NdFilterCalculator />
}
