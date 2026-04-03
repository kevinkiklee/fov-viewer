import type { Metadata } from 'next'
import { ColorHarmony } from './_components/ColorHarmony'

export const metadata: Metadata = {
  title: 'Color Scheme Generator',
  description: 'Build color palettes for photography shoots using color theory.',
  openGraph: {
    images: ['/images/og/color-scheme-generator.png'],
  },
}

export default function ColorSchemeGeneratorPage() {
  return <ColorHarmony />
}
