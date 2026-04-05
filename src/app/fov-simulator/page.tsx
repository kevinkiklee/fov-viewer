import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { FovSimulator } from './_components/FovSimulator'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.fov-simulator')
  return { title: t('title'), description: t('description') }
}

export default function FovSimulatorPage() {
  return <FovSimulator />
}
