import type { Metadata } from 'next'
import { HistogramExplainer } from '@/components/tools/histogram/HistogramExplainer'

export const metadata: Metadata = {
  title: 'EXIF Viewer',
  description: 'View EXIF metadata, histogram, and image preview for any photo. 100% client-side — your photos never leave your device.',
}

export default function ExifViewerPage() {
  return <HistogramExplainer />
}
