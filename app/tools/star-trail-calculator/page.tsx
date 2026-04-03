import type { Metadata } from 'next'
import { StarTrailCalculator } from '@/components/tools/star-trail-calculator/StarTrailCalculator'

export const metadata: Metadata = {
  title: 'Star Trail Calculator',
  description: 'Calculate max exposure for sharp stars or plan star trail stacking shots.',
}

export default function StarTrailCalculatorPage() {
  return <StarTrailCalculator />
}
