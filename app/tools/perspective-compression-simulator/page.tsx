import type { Metadata } from 'next'
import { PerspectiveCompressionSimulator } from '@/components/tools/perspective-compression-simulator/PerspectiveCompressionSimulator'

export const metadata: Metadata = {
  title: 'Perspective Compression Simulator',
  description: 'See how focal length affects background compression. Interactive 3D visualization.',
}

export default function PerspectiveCompressionSimulatorPage() {
  return <PerspectiveCompressionSimulator />
}
