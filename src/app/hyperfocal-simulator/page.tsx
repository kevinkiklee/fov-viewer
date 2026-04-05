import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { HyperfocalSimulator } from './_components/HyperfocalSimulator'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.hyperfocal-simulator')
  return { title: t('title'), description: t('description') }
}

export default function HyperfocalSimulatorPage() {
  return <HyperfocalSimulator />
}
