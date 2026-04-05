import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { ExifViewer } from './_components/ExifViewer'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.exif-viewer')
  return { title: t('title'), description: t('description') }
}

export default function ExifViewerPage() {
  return <ExifViewer />
}
