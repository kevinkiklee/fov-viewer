import type { Metadata } from 'next'
import { ToolPageShell } from '@/components/shared/ToolPageShell'
import { HistogramExplainer } from '@/components/tools/histogram/HistogramExplainer'

export const metadata: Metadata = {
  title: 'Histogram Explainer',
  description: 'Upload a photo to see its histogram with educational annotations. Learn what your histogram means.',
}

export default function HistogramPage() {
  return (
    <ToolPageShell slug="histogram">
      <HistogramExplainer />
    </ToolPageShell>
  )
}
