import type { Metadata } from 'next'
import { PerspectiveCompressionSimulator } from './_components/PerspectiveCompressionSimulator'

export const metadata: Metadata = {
  title: 'Perspective Compression Simulator',
  description: 'Interactive 3D simulator showing how focal length and distance affect perspective compression. See background compression change in real time.',
}

export default function PerspectiveCompressionSimulatorPage() {
  return <PerspectiveCompressionSimulator />
}
