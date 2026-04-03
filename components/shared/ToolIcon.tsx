import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const s = 20 // default size

/** FOV Simulator — viewfinder / angle of view */
function FovSimulator(p: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M2 12l7-8v5h6V4l7 8-7 8v-5H9v5z" />
    </svg>
  )
}

/** Color Harmony Picker — palette / color wheel */
function ColorHarmony(p: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="7" r="2.5" />
      <circle cx="7.5" cy="15" r="2.5" />
      <circle cx="16.5" cy="15" r="2.5" />
    </svg>
  )
}

/** Exposure Triangle Simulator — aperture blades */
function ExposureSimulator(p: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polygon points="12,2 22,18 2,18" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  )
}

/** Depth of Field Calculator — focus layers */
function DofCalculator(p: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="12" r="7" strokeDasharray="3 2" />
      <circle cx="12" cy="12" r="10" strokeDasharray="2 3" opacity={0.4} />
    </svg>
  )
}

/** Hyperfocal Distance Simulator — infinity focus */
function HyperfocalSimulator(p: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M2 12h20" />
      <path d="M12 6v12" />
      <path d="M7 8c0 0 2.5 4 5 4s5-4 5-4" />
      <path d="M7 16c0 0 2.5-4 5-4s5 4 5 4" />
    </svg>
  )
}

/** Shutter Speed Guide — clock / timer */
function ShutterSpeedGuide(p: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="13" r="9" />
      <path d="M12 9v4l3 2" />
      <path d="M10 2h4" />
    </svg>
  )
}

/** ND Filter Calculator — dark filter disc */
function NdFilterCalculator(p: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="5" />
      <path d="M12 2v3" />
      <path d="M12 19v3" />
      <path d="M2 12h3" />
      <path d="M19 12h3" />
    </svg>
  )
}

/** Diffraction Limit Calculator — wave pattern */
function DiffractionLimit(p: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M2 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0" />
      <path d="M2 17c2-3 4-3 6 0s4 3 6 0 4-3 6 0" opacity={0.4} />
      <path d="M2 7c2-3 4-3 6 0s4 3 6 0 4-3 6 0" opacity={0.4} />
    </svg>
  )
}

/** Star Trail Calculator — star with trail arc */
function StarTrailCalculator(p: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 2l2.1 6.5H21l-5.5 4 2.1 6.5L12 15l-5.6 4 2.1-6.5L3 8.5h6.9z" />
    </svg>
  )
}

/** White Balance Visualizer — sun/warm-cool */
function WhiteBalance(p: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="5" />
      <path d="M12 2v3" />
      <path d="M12 19v3" />
      <path d="M4.22 4.22l2.12 2.12" />
      <path d="M17.66 17.66l2.12 2.12" />
      <path d="M2 12h3" />
      <path d="M19 12h3" />
      <path d="M4.22 19.78l2.12-2.12" />
      <path d="M17.66 6.34l2.12-2.12" />
    </svg>
  )
}

/** Sensor Size Comparison — nested rectangles */
function SensorSize(p: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <rect x="5" y="7" width="14" height="10" rx="1" strokeDasharray="3 2" />
      <rect x="8" y="9" width="8" height="6" rx="1" strokeDasharray="2 2" opacity={0.5} />
    </svg>
  )
}

/** EXIF Viewer — file info */
function ExifViewer(p: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8" />
      <path d="M8 17h5" />
    </svg>
  )
}

/** Perspective Compression Simulator — compress/telephoto */
function PerspectiveCompression(p: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M8 3v18" />
      <path d="M16 3v18" />
      <path d="M3 8h4" />
      <path d="M3 16h4" />
      <path d="M17 8h4" />
      <path d="M17 16h4" />
      <path d="M5 12h2" />
      <path d="M17 12h2" />
    </svg>
  )
}

const ICON_MAP: Record<string, (props: IconProps) => React.JSX.Element> = {
  'fov-simulator': FovSimulator,
  'color-scheme-generator': ColorHarmony,
  'exposure-simulator': ExposureSimulator,
  'dof-calculator': DofCalculator,
  'hyperfocal-simulator': HyperfocalSimulator,
  'shutter-speed-guide': ShutterSpeedGuide,
  'nd-filter-calculator': NdFilterCalculator,
  'diffraction-limit': DiffractionLimit,
  'star-trail-calculator': StarTrailCalculator,
  'white-balance-visualizer': WhiteBalance,
  'sensor-size': SensorSize,
  'exif-viewer': ExifViewer,
  'perspective-compression-simulator': PerspectiveCompression,
}

interface ToolIconProps extends IconProps {
  slug: string
}

export function ToolIcon({ slug, ...props }: ToolIconProps) {
  const Icon = ICON_MAP[slug]
  if (!Icon) return null
  return <Icon {...props} />
}
