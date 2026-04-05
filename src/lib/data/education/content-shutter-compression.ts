import type { ToolEducationSkeleton } from './types'

export const SHUTTER_SPEED_SKELETON: ToolEducationSkeleton = {
  slug: 'shutter-speed-visualizer',
  keyFactorCount: 4,
  tipCount: 3,
  tooltipKeys: ['focalLength', 'sensor', 'stabilization', 'subjectMotion', 'recommendedShutterSpeed'],
  challenges: [
    {
      id: 'ss-reciprocal-basic',
      difficulty: 'beginner',
      targetField: 'focalLength',
      optionValues: ['1/50', '1/100', '1/200', '1/500'],
      correctOption: '1/100',
    },
    {
      id: 'ss-crop-factor',
      difficulty: 'beginner',
      targetField: 'sensor',
      optionValues: ['1/50', '1/75', '1/100', '1/125'],
      correctOption: '1/75',
    },
    {
      id: 'ss-ibis-benefit',
      difficulty: 'intermediate',
      targetField: 'stabilization',
      optionValues: ['1/30', '1/8', '1/3', '1s'],
      correctOption: '1/3',
    },
    {
      id: 'ss-moving-subject',
      difficulty: 'intermediate',
      targetField: 'subjectMotion',
      optionValues: ['yes-ibis', 'no-250', 'no-60', 'depends-iso'],
      correctOption: 'no-250',
    },
    {
      id: 'ss-panning-technique',
      difficulty: 'advanced',
      targetField: 'shutterSpeed',
      optionValues: ['very-fast', 'fast', 'panning-range', 'very-slow'],
      correctOption: 'panning-range',
    },
  ],
}

export const PERSPECTIVE_COMPRESSION_SKELETON: ToolEducationSkeleton = {
  slug: 'perspective-compression-simulator',
  keyFactorCount: 3,
  tipCount: 3,
  tooltipKeys: ['focalLength', 'distance', 'maintainSize'],
  challenges: [
    {
      id: 'compression-mountain',
      difficulty: 'beginner',
      targetField: 'focalLength',
      optionValues: ['200', '24', '50'],
      correctOption: '200',
    },
  ],
}
