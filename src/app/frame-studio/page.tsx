import type { Metadata } from 'next'
import { FrameStudio } from './_components/FrameStudio'

export const metadata: Metadata = {
  title: 'Frame Studio',
  description: 'Crop, frame, and compose photos with grid overlays. 100% client-side — your photos never leave your device.',
}

export default function FrameStudioPage() {
  return <FrameStudio />
}
