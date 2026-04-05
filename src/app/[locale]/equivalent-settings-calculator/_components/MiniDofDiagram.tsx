'use client'

interface MiniDofDiagramProps {
  sourceNear: number
  sourceFar: number
  targetNear: number
  targetFar: number
  distance: number
  sourceColor: string
  targetColor: string
}

const W = 200
const H = 40
const PAD = 8

/** Map a distance to x position within the diagram. Uses log scale. */
function mapX(d: number, minD: number, maxD: number): number {
  const logMin = Math.log(Math.max(minD, 0.01))
  const logMax = Math.log(Math.max(maxD, 0.02))
  const range = logMax - logMin
  if (range <= 0) return PAD
  const t = (Math.log(Math.max(d, 0.01)) - logMin) / range
  return PAD + t * (W - 2 * PAD)
}

export function MiniDofDiagram({
  sourceNear, sourceFar, targetNear, targetFar,
  distance, sourceColor, targetColor,
}: MiniDofDiagramProps) {
  const clampFar = (v: number) => (isFinite(v) ? v : distance * 10)
  const sFar = clampFar(sourceFar)
  const tFar = clampFar(targetFar)

  const allDist = [sourceNear, sFar, targetNear, tFar, distance]
  const minD = Math.min(...allDist) * 0.8
  const maxD = Math.max(...allDist) * 1.2

  const sX1 = mapX(sourceNear, minD, maxD)
  const sX2 = mapX(sFar, minD, maxD)
  const tX1 = mapX(targetNear, minD, maxD)
  const tX2 = mapX(tFar, minD, maxD)
  const subjectX = mapX(distance, minD, maxD)

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      {/* Source DOF bar */}
      <rect
        x={sX1} y={8} width={Math.max(sX2 - sX1, 2)} height={10}
        rx={3} fill={sourceColor} opacity={0.4}
      />
      {/* Target DOF bar */}
      <rect
        x={tX1} y={22} width={Math.max(tX2 - tX1, 2)} height={10}
        rx={3} fill={targetColor} opacity={0.4}
      />
      {/* Subject marker */}
      <line
        x1={subjectX} y1={4} x2={subjectX} y2={36}
        stroke="var(--text-primary)" strokeWidth={1.5} strokeDasharray="3 2"
      />
      <circle cx={subjectX} cy={20} r={2.5} fill="var(--text-primary)" />
    </svg>
  )
}
