import type { ToolEducationSkeleton } from './types'

export const STAR_TRAIL_SKELETON: ToolEducationSkeleton = {
  slug: 'star-trail-calculator',
  deeperSections: 3,
  keyFactorCount: 4,
  tipCount: 3,
  tooltipKeys: ['mode', 'focalLength', 'sensor', 'resolution', 'aperture', 'latitude', 'exposurePerFrame', 'numberOfFrames', 'gapBetweenFrames'],
  challenges: [
    {
      id: 'star-milky-way',
      difficulty: 'beginner',
      targetField: 'focalLength',
      optionValues: ['5', '10', '20', '60'],
      correctOption: '20',
    },
    {
      id: 'star-telephoto',
      difficulty: 'beginner',
      targetField: 'focalLength',
      optionValues: ['1.7', '2.5', '5', '10'],
      correctOption: '1.7',
    },
    {
      id: 'star-trail-plan',
      difficulty: 'intermediate',
      targetField: 'numberOfFrames',
      optionValues: ['120', '180', '225', '240'],
      correctOption: '225',
    },
    {
      id: 'star-500-vs-npf',
      difficulty: 'intermediate',
      targetField: 'resolution',
      optionValues: ['focus', 'resolution', 'shake', 'too-wide'],
      correctOption: 'resolution',
    },
    {
      id: 'star-stacking-vs-single',
      difficulty: 'advanced',
      targetField: 'exposurePerFrame',
      optionValues: ['longer-trails', 'no-movement', 'stacking-benefits', 'no-difference'],
      correctOption: 'stacking-benefits',
    },
  ],
}

export const ND_FILTER_SKELETON: ToolEducationSkeleton = {
  slug: 'nd-filter-calculator',
  keyFactorCount: 3,
  tipCount: 3,
  tooltipKeys: ['baseShutterSpeed', 'ndFilter', 'resultingShutterSpeed', 'stopsAdded'],
  challenges: [
    {
      id: 'nd-basic-calc',
      difficulty: 'beginner',
      targetField: 'ndFilter',
      optionValues: ['1/60', '1/30', '1/15', '1/8'],
      correctOption: '1/15',
    },
    {
      id: 'nd-long-exposure',
      difficulty: 'beginner',
      targetField: 'ndFilter',
      optionValues: ['6', '8', '10', '15'],
      correctOption: '10',
    },
    {
      id: 'nd-seascape-timing',
      difficulty: 'intermediate',
      targetField: 'ndFilter',
      optionValues: ['6', '9', '10', '13'],
      correctOption: '9',
    },
    {
      id: 'nd-wide-aperture-sun',
      difficulty: 'intermediate',
      targetField: 'ndFilter',
      optionValues: ['yes', 'need-nd', 'raise-iso'],
      correctOption: 'need-nd',
    },
    {
      id: 'nd-stack-calc',
      difficulty: 'advanced',
      targetField: 'ndFilter',
      optionValues: ['0.5', '2-vignette', '4-heat', '8-fine'],
      correctOption: '2-vignette',
    },
  ],
}

export const WHITE_BALANCE_SKELETON: ToolEducationSkeleton = {
  slug: 'white-balance-visualizer',
  deeperSections: 3,
  keyFactorCount: 4,
  tipCount: 3,
  tooltipKeys: ['colorTemperature', 'preset', 'rgbValues', 'hexCode'],
  challenges: [
    {
      id: 'wb-indoor-orange',
      difficulty: 'beginner',
      targetField: 'colorTemperature',
      optionValues: ['daylight', 'tungsten', 'shade', 'fluorescent'],
      correctOption: 'tungsten',
    },
    {
      id: 'wb-golden-hour',
      difficulty: 'beginner',
      targetField: 'colorTemperature',
      optionValues: ['auto', 'tungsten', 'daylight', 'flash'],
      correctOption: 'daylight',
    },
    {
      id: 'wb-kelvin-direction',
      difficulty: 'intermediate',
      targetField: 'colorTemperature',
      optionValues: ['increase', 'decrease', 'no-effect'],
      correctOption: 'increase',
    },
    {
      id: 'wb-mixed-light',
      difficulty: 'intermediate',
      targetField: 'colorTemperature',
      optionValues: ['tungsten', 'daylight', 'raw-post', 'iso'],
      correctOption: 'raw-post',
    },
    {
      id: 'wb-creative-cold',
      difficulty: 'advanced',
      targetField: 'colorTemperature',
      optionValues: ['2200', '3200', '7500', '5500'],
      correctOption: '7500',
    },
  ],
}
