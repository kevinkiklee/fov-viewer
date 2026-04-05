import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { WhiteBalance } from './_components/WhiteBalance'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.white-balance-visualizer')
  return { title: t('title'), description: t('description') }
}

export default function WhiteBalancePage() {
  return <WhiteBalance />
}
