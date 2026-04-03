import type { Metadata } from 'next'
import { LearningPaths } from '@/components/tools/learning-paths/LearningPaths'

export const metadata: Metadata = {
  title: 'Learning Paths',
  description: 'Guided photography learning paths — master exposure, sharpness, night sky photography, and more.',
}

export default function LearningPathsPage() {
  return <LearningPaths />
}
