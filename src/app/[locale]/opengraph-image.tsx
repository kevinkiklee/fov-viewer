import { getTranslations } from 'next-intl/server'
import { generateHomepageOgImage } from '@/lib/og'
import { routing } from '@/lib/i18n/routing'

export const alt = 'PhotoTools — Free Photography Tools'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata.site' })
  return generateHomepageOgImage({
    title: t('ogTitle'),
    description: t('description'),
  })
}
