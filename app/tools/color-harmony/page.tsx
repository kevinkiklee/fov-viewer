import type { Metadata } from 'next'
import { ColorHarmony } from '@/components/tools/color-harmony/ColorHarmony'

export const metadata: Metadata = {
  title: 'Color Harmony Picker',
  description: 'Build color palettes for photography shoots using color theory.',
  openGraph: {
    images: ['/images/og/color-harmony.jpg'],
  },
}

export default function ColorHarmonyPage() {
  return <ColorHarmony />
}
