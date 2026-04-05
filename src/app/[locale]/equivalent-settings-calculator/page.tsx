import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getAlternates } from '@/lib/i18n/metadata'
import { EquivalentSettings } from './_components/EquivalentSettings'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.equivalent-settings-calculator')
  return { title: t('title'), description: t('description'), alternates: getAlternates('/equivalent-settings-calculator') }
}

export default function EquivalentSettingsPage() {
  return <EquivalentSettings />
}
