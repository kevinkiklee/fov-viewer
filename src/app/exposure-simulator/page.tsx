import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { ExposureSimulator } from './_components/ExposureSimulator'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.exposure-simulator')
  return { title: t('title'), description: t('description') }
}

export default function ExposureSimulatorPage() {
  return <ExposureSimulator />
}
