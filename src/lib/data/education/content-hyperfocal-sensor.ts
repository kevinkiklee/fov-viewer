import type { ToolEducationSkeleton } from './types'

export const HYPERFOCAL_SKELETON: ToolEducationSkeleton = {
  slug: 'hyperfocal-simulator',
  keyFactorCount: 4,
  tipCount: 3,
  tooltipKeys: ['Sensor'],
  challenges: [
    {
      id: 'hyp-beginner-1',
      difficulty: 'beginner',
      targetField: 'sensor',
      optionValues: ['ff', 'apsc', 'm43'],
      correctOption: 'ff',
    },
    {
      id: 'hyp-beginner-2',
      difficulty: 'beginner',
      targetField: 'focalLength',
      optionValues: ['24', '50'],
      correctOption: '24',
    },
    {
      id: 'hyp-intermediate-1',
      difficulty: 'intermediate',
      targetField: 'aperture',
      optionValues: ['wide', 'mid', 'narrow'],
      correctOption: 'mid',
    },
    {
      id: 'hyp-intermediate-2',
      difficulty: 'intermediate',
      targetField: 'sensor',
      optionValues: ['focal', 'coc', 'af'],
      correctOption: 'coc',
    },
    {
      id: 'hyp-advanced-1',
      difficulty: 'advanced',
      targetField: 'aperture',
      optionValues: ['f22', 'f11'],
      correctOption: 'f11',
    },
  ],
}

export const SENSOR_SIZE_SKELETON: ToolEducationSkeleton = {
  slug: 'sensor-size-comparison',
  deeperSections: 3,
  keyFactorCount: 4,
  tipCount: 3,
  tooltipKeys: ['Sensor', 'Display Mode', 'Resolution', 'Crop Factor'],
  challenges: [
    {
      id: 'ss-beginner-1',
      difficulty: 'beginner',
      targetField: 'sensor',
      optionValues: ['24', '30', '18'],
      correctOption: '24',
    },
    {
      id: 'ss-beginner-2',
      difficulty: 'beginner',
      targetField: 'sensor',
      optionValues: ['25', '75', '100'],
      correctOption: '100',
    },
    {
      id: 'ss-intermediate-1',
      difficulty: 'intermediate',
      targetField: 'sensor',
      optionValues: ['ff', 'apsc', 'same'],
      correctOption: 'ff',
    },
    {
      id: 'ss-intermediate-2',
      difficulty: 'intermediate',
      targetField: 'sensor',
      optionValues: ['apsc_c', 'm43', '1in'],
      correctOption: 'm43',
    },
    {
      id: 'ss-advanced-1',
      difficulty: 'advanced',
      targetField: 'sensor',
      optionValues: ['mf', 'ff', 'same'],
      correctOption: 'mf',
    },
  ],
}
