'use client'

import { useMemo } from 'react'
import { FIGURE_DEPTH_ZONES } from '@/lib/data/dofSimulator'

interface SubjectFigureProps {
  subjectDistance: number
  focalLength: number
  sensorHeight: number
  viewportHeight: number
  focalResult: { nearFocus: number; farFocus: number }
}

const COLOR_SHARP = '#22c55e'
const COLOR_FRONT = '#38bdf8'
const COLOR_BEHIND = '#f59e0b'
const FULL_BODY_MM = 1700

function getZoneStyle(
  offsetMm: number,
  subjectDistance: number,
  nearFocus: number,
  farFocus: number,
): { color: string; blur: number } {
  const zoneDist = subjectDistance + offsetMm / 1000
  const dofRange = Math.max(farFocus - nearFocus, 0.001)

  if (zoneDist >= nearFocus && zoneDist <= farFocus) {
    return { color: COLOR_SHARP, blur: 0 }
  }
  if (zoneDist < nearFocus) {
    const overshoot = (nearFocus - zoneDist) / dofRange
    return { color: COLOR_FRONT, blur: Math.min(overshoot * 8, 6) }
  }
  const overshoot = (zoneDist - farFocus) / dofRange
  return { color: COLOR_BEHIND, blur: Math.min(overshoot * 8, 6) }
}

/**
 * Organic human silhouette SVG overlay with depth-zone coloring.
 * Each body region gets a glow/blur effect based on whether it's in the DOF range.
 */
export function SubjectFigure({
  subjectDistance, focalLength, sensorHeight, viewportHeight, focalResult,
}: SubjectFigureProps) {
  const figureHeightPx = useMemo(() => {
    const fovMm = subjectDistance * (sensorHeight / focalLength) * 1000
    if (fovMm <= 0) return 0
    return viewportHeight * (FULL_BODY_MM / fovMm)
  }, [subjectDistance, sensorHeight, focalLength, viewportHeight])

  const zones = useMemo(() =>
    FIGURE_DEPTH_ZONES.map((z) => ({
      ...z,
      ...getZoneStyle(z.offsetMm, subjectDistance, focalResult.nearFocus, focalResult.farFocus),
    })),
    [subjectDistance, focalResult.nearFocus, focalResult.farFocus],
  )

  if (figureHeightPx <= 0) return null
  const h = Math.min(Math.max(figureHeightPx, 60), viewportHeight * 1.1)
  const w = h * 0.35

  // Zone lookups
  const nose = zones.find((z) => z.key === 'nose')!
  const face = zones.find((z) => z.key === 'face')!
  const eyes = zones.find((z) => z.key === 'eyes')!
  const ears = zones.find((z) => z.key === 'ears')!
  const body = zones.find((z) => z.key === 'body')!

  // Scale factor for the SVG viewBox (design at 100x280)
  const vbW = 100
  const vbH = 280

  return (
    <svg
      width={w} height={h}
      viewBox={`0 0 ${vbW} ${vbH}`}
      style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none', opacity: 0.85,
      }}
    >
      <defs>
        {/* Blur filters for out-of-focus zones */}
        {zones.filter((z) => z.blur > 0).map((z) => (
          <filter key={z.key} id={`blur-${z.key}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation={z.blur} />
          </filter>
        ))}
        {/* Subtle outer glow for the whole figure */}
        <filter id="figure-glow" x="-20%" y="-10%" width="140%" height="120%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
          <feFlood floodColor="#000" floodOpacity="0.4" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="shadow" />
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g filter="url(#figure-glow)">
        {/* Body + Legs (behind focus zone) */}
        <g filter={body.blur > 0 ? `url(#blur-body)` : undefined}>
          {/* Torso */}
          <path
            d="M35 95 C30 95 22 100 22 108 L24 170 C24 174 28 178 34 178 L66 178 C72 178 76 174 76 170 L78 108 C78 100 70 95 65 95 Z"
            fill={body.color} opacity={0.4}
          />
          {/* Left leg */}
          <path
            d="M34 176 L32 250 C32 256 36 260 40 260 L44 260 C48 260 50 256 50 250 L50 176"
            fill={body.color} opacity={0.35}
          />
          {/* Right leg */}
          <path
            d="M50 176 L50 250 C50 256 52 260 56 260 L60 260 C64 260 68 256 68 250 L66 176"
            fill={body.color} opacity={0.35}
          />
          {/* Left arm */}
          <path
            d="M24 105 C18 108 14 120 16 145 C17 150 20 150 22 148 L26 115"
            fill={body.color} opacity={0.3}
          />
          {/* Right arm */}
          <path
            d="M76 105 C82 108 86 120 84 145 C83 150 80 150 78 148 L74 115"
            fill={body.color} opacity={0.3}
          />
        </g>

        {/* Ears zone (behind focus) */}
        <g filter={ears.blur > 0 ? `url(#blur-ears)` : undefined}>
          <ellipse cx="22" cy="55" rx="6" ry="10" fill={ears.color} opacity={0.4} />
          <ellipse cx="78" cy="55" rx="6" ry="10" fill={ears.color} opacity={0.4} />
        </g>

        {/* Head/face (may be slightly in front) */}
        <g filter={face.blur > 0 ? `url(#blur-face)` : undefined}>
          <ellipse cx="50" cy="50" rx="22" ry="28" fill={face.color} opacity={0.35} />
        </g>

        {/* Eyes zone — at focus plane, always sharpest */}
        <g filter={eyes.blur > 0 ? `url(#blur-eyes)` : undefined}>
          <ellipse cx="50" cy="46" rx="18" ry="12" fill={eyes.color} opacity={0.45} />
          {/* Eye dots */}
          <circle cx="40" cy="45" r="2.5" fill={eyes.color} opacity={0.7} />
          <circle cx="60" cy="45" r="2.5" fill={eyes.color} opacity={0.7} />
        </g>

        {/* Nose zone (in front, closest to camera) */}
        <g filter={nose.blur > 0 ? `url(#blur-nose)` : undefined}>
          <ellipse cx="50" cy="58" rx="5" ry="6" fill={nose.color} opacity={0.5} />
        </g>

        {/* Neck */}
        <rect x="43" y="76" width="14" height="20" rx="5" fill={body.color} opacity={0.3} />

        {/* Subtle silhouette outline */}
        <ellipse cx="50" cy="50" rx="24" ry="30" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
        <path
          d="M35 93 C28 93 20 99 20 108 L22 172 C22 176 27 180 34 180 L66 180 C73 180 78 176 78 172 L80 108 C80 99 72 93 65 93"
          fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5"
        />
      </g>
    </svg>
  )
}
