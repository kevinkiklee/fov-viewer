const BLADE_PATHS = [
  'M0.00,-5.00 L2.66,-8.60 A9,9 0 0,1 8.38,-3.28 L3.91,-3.12 Z',
  'M3.91,-3.12 L8.38,-3.28 A9,9 0 0,1 7.79,4.51 L4.87,1.11 Z',
  'M4.87,1.11 L7.79,4.51 A9,9 0 0,1 1.33,8.90 L2.17,4.50 Z',
  'M2.17,4.50 L1.33,8.90 A9,9 0 0,1 -6.13,6.59 L-2.17,4.50 Z',
  'M-2.17,4.50 L-6.13,6.59 A9,9 0 0,1 -8.97,-0.68 L-4.87,1.11 Z',
  'M-4.87,1.11 L-8.97,-0.68 A9,9 0 0,1 -5.06,-7.44 L-3.91,-3.12 Z',
  'M-3.91,-3.12 L-5.06,-7.44 A9,9 0 0,1 2.66,-8.60 L-0.00,-5.00 Z',
]

interface ApertureLogoProps {
  size?: number
  className?: string
}

export function ApertureLogo({ size = 16, className }: ApertureLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <g transform="translate(10,10)">
        {BLADE_PATHS.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="var(--accent)"
            stroke="var(--bg-secondary)"
            strokeWidth="0.4"
            strokeLinejoin="round"
          />
        ))}
      </g>
    </svg>
  )
}
