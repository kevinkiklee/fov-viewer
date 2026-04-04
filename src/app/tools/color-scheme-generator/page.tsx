import type { Metadata } from 'next'
import { ColorHarmony } from './_components/ColorHarmony'

export const metadata: Metadata = {
  title: 'Color Scheme Generator',
  description: 'Generate color palettes for photography using complementary, analogous, triadic, and tetradic color harmonies. Interactive color wheel with photo picker.',
  openGraph: {
    images: ['/images/og/color-scheme-generator.png'],
  },
}

export default function ColorSchemeGeneratorPage() {
  return <ColorHarmony />
}
