import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { FrameStudio } from './_components/FrameStudio'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.frame-studio')
  return { title: t('title'), description: t('description') }
}

export default function FrameStudioPage() {
  return <FrameStudio />
}
