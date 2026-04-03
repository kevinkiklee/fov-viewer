import type { Metadata } from 'next'
import { ExifViewer } from '@/components/tools/exif-viewer/ExifViewer'

export const metadata: Metadata = {
  title: 'EXIF Viewer',
  description: 'View EXIF metadata, histogram, and image preview for any photo. 100% client-side — your photos never leave your device.',
  openGraph: {
    images: ['/images/og/exif-viewer.jpg'],
  },
}

export default function ExifViewerPage() {
  return <ExifViewer />
}
