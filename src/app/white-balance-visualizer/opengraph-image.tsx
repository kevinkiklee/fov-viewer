import { generateOgImage } from '@/lib/og'

export const alt = 'PhotoTools'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return generateOgImage('white-balance-visualizer')
}
