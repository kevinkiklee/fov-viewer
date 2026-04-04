import type { Metadata } from 'next'
import { StarTrailCalculator } from './_components/StarTrailCalculator'

export const metadata: Metadata = {
  title: 'Star Trail Calculator',
  description: 'Calculate the maximum exposure time for pinpoint stars using the 500, NPF, and other rules. Plan star trail stacking shots for any location.',
}

export default function StarTrailCalculatorPage() {
  return <StarTrailCalculator />
}
