import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { StarTrailCalculator } from './_components/StarTrailCalculator'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.star-trail-calculator')
  return { title: t('title'), description: t('description') }
}

export default function StarTrailCalculatorPage() {
  return <StarTrailCalculator />
}
