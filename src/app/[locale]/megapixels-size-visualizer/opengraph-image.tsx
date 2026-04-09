import { generateOgImage } from '@/lib/og'

export const alt = 'PhotoTools'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  let name: string | undefined
  let description: string | undefined
  try {
    const messages = (await import(`@/lib/i18n/messages/${locale}/tools.json`)).default
    name = messages?.tools?.['megapixels-size-visualizer']?.name
    description = messages?.tools?.['megapixels-size-visualizer']?.description
  } catch { /* fallback in og.tsx */ }
  return generateOgImage('megapixels-size-visualizer', { name, description })
}
