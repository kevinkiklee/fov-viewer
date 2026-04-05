import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { ColorHarmony } from './_components/ColorHarmony'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.color-scheme-generator')
  return { title: t('title'), description: t('description') }
}

export default function ColorSchemeGeneratorPage() {
  return <ColorHarmony />
}
