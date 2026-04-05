import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { SensorSize } from './_components/SensorSize'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.sensor-size-comparison')
  return { title: t('title'), description: t('description') }
}

export default function SensorSizePage() {
  return <SensorSize />
}
