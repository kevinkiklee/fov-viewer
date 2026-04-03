import type { Metadata } from 'next'
import { ColorHarmony } from '@/components/tools/color-harmony/ColorHarmony'

export const metadata: Metadata = {
  title: 'Color Scheme Generator',
  description: 'Build color palettes for photography shoots using color theory.',
}

export default function ColorSchemeGeneratorPage() {
  return <ColorHarmony />
}
