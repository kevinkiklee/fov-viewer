import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { DoFCalculator } from './_components/DoFCalculator'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.dof-calculator')
  return { title: t('title'), description: t('description') }
}

export default function DoFCalculatorPage() {
  return <DoFCalculator />
}
