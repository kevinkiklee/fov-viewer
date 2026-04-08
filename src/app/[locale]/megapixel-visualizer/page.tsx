import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getAlternates } from '@/lib/i18n/metadata'
import { getToolBySlug, getToolStatus } from '@/lib/data/tools'
import { MegapixelVisualizer } from './_components/MegapixelVisualizer'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.megapixel-visualizer')
  const title = t('title')
  const description = t('description')
  const tool = getToolBySlug('megapixel-visualizer')
  const isDraft = tool ? getToolStatus(tool) === 'draft' : false
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { card: 'summary_large_image', title, description },
    alternates: getAlternates('/megapixel-visualizer'),
    robots: isDraft ? { index: false, follow: true } : undefined,
  }
}

export default function MegapixelVisualizerPage() {
  return <MegapixelVisualizer />
}
