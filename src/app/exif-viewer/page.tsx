import type { Metadata } from 'next'
import { ExifViewer } from './_components/ExifViewer'

export const metadata: Metadata = {
  title: 'EXIF Viewer',
  description: 'View EXIF metadata, histogram, and image preview for any photo. 100% client-side — your photos never leave your device.',
}

export default function ExifViewerPage() {
  return <ExifViewer />
}
