import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { PerspectiveCompressionSimulator } from './_components/PerspectiveCompressionSimulator'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.perspective-compression-simulator')
  return { title: t('title'), description: t('description') }
}

export default function PerspectiveCompressionSimulatorPage() {
  return <PerspectiveCompressionSimulator />
}
