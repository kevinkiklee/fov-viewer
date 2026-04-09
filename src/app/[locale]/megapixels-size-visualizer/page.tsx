import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getAlternates } from '@/lib/i18n/metadata'
import { getToolBySlug, getToolStatus } from '@/lib/data/tools'
import { MegapixelVisualizer } from './_components/MegapixelVisualizer'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.megapixels-size-visualizer')
  const title = t('title')
  const description = t('description')
  const tool = getToolBySlug('megapixels-size-visualizer')
  const isDraft = tool ? getToolStatus(tool) === 'draft' : false
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { card: 'summary_large_image', title, description },
    alternates: getAlternates('/megapixels-size-visualizer'),
    robots: isDraft ? { index: false, follow: true } : undefined,
  }
}

export default function MegapixelVisualizerPage() {
  return <MegapixelVisualizer />
}
