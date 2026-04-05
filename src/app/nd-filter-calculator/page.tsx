import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { NdFilterCalculator } from './_components/NdFilterCalculator'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.nd-filter-calculator')
  return { title: t('title'), description: t('description') }
}

export default function NdFilterCalculatorPage() {
  return <NdFilterCalculator />
}
