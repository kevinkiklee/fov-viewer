import type { ToolEducationSkeleton } from './types'

export const EXPOSURE_SIMULATOR_SKELETON: ToolEducationSkeleton = {
  slug: 'exposure-simulator',
  keyFactorCount: 4,
  tipCount: 3,
  tooltipKeys: ['aperture', 'shutterSpeed', 'iso', 'ev'],
  challenges: [
    {
      id: 'exp-freeze-action',
      difficulty: 'beginner',
      targetField: 'shutterSpeed',
      optionValues: ['aperture', 'shutter', 'iso', 'focal'],
      correctOption: 'shutter',
    },
    {
      id: 'exp-low-light',
      difficulty: 'beginner',
      targetField: 'iso',
      optionValues: ['iso-1600', 'slow-shutter', 'close-aperture', 'smaller-sensor'],
      correctOption: 'iso-1600',
    },
    {
      id: 'exp-waterfall-silk',
      difficulty: 'intermediate',
      targetField: 'shutterSpeed',
      optionValues: ['slow-narrow', 'fast-wide', 'high-iso', 'same-speed'],
      correctOption: 'slow-narrow',
    },
    {
      id: 'exp-stop-equivalence',
      difficulty: 'intermediate',
      targetField: 'shutterSpeed',
      optionValues: ['1/500', '1/250', '1/125-iso100', '1/60-iso100'],
      correctOption: '1/500',
    },
    {
      id: 'exp-concert-challenge',
      difficulty: 'advanced',
      targetField: 'iso',
      optionValues: ['400', '800', '3200', '12800'],
      correctOption: '3200',
    },
  ],
}
