import type { Metadata } from 'next'
import { ExifViewer } from '@/components/tools/exif-viewer/ExifViewer'

export const metadata: Metadata = {
  title: 'EXIF Viewer',
  description: 'View photo metadata without uploading. 100% client-side — your photos never leave your device.',
}

export default function ExifViewerPage() {
  return <ExifViewer />
}
