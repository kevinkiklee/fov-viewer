import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { ShutterSpeedGuide } from './_components/ShutterSpeedGuide'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.shutter-speed-visualizer')
  return { title: t('title'), description: t('description') }
}

export default function ShutterSpeedVisualizerPage() {
  return <ShutterSpeedGuide />
}
