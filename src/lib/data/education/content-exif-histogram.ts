import type { ToolEducationSkeleton } from './types'

export const EXIF_VIEWER_SKELETON: ToolEducationSkeleton = {
  slug: 'exif-viewer',
  keyFactorCount: 4,
  tipCount: 3,
  tooltipKeys: ['Make', 'Model', 'Aperture', 'Shutter Speed', 'ISO', 'Focal Length', 'Focal Length (35mm equiv)', 'GPS'],
  challenges: [
    {
      id: 'exif-beginner-1',
      difficulty: 'beginner',
      targetField: 'section',
      optionValues: ['camera', 'lens', 'settings'],
      correctOption: 'lens',
    },
    {
      id: 'exif-beginner-2',
      difficulty: 'beginner',
      targetField: 'lightLevel',
      optionValues: ['bright', 'dim'],
      correctOption: 'bright',
    },
    {
      id: 'exif-intermediate-1',
      difficulty: 'intermediate',
      targetField: 'sensor',
      optionValues: ['ff', 'apsc', 'm43'],
      correctOption: 'apsc',
    },
    {
      id: 'exif-intermediate-2',
      difficulty: 'intermediate',
      targetField: 'photo',
      optionValues: ['a', 'b'],
      correctOption: 'b',
    },
    {
      id: 'exif-advanced-1',
      difficulty: 'advanced',
      targetField: 'analysis',
      optionValues: ['correct', 'wrong1', 'wrong2'],
      correctOption: 'correct',
    },
  ],
}

export const HISTOGRAM_SKELETON: ToolEducationSkeleton = {
  slug: 'histogram',
  keyFactorCount: 4,
  tipCount: 3,
  tooltipKeys: ['View Mode', 'Shadows', 'Midtones', 'Highlights', 'Black Clipping', 'White Clipping'],
  challenges: [
    {
      id: 'hist-beginner-1',
      difficulty: 'beginner',
      targetField: 'diagnosis',
      optionValues: ['dark', 'bright', 'perfect'],
      correctOption: 'dark',
    },
    {
      id: 'hist-beginner-2',
      difficulty: 'beginner',
      targetField: 'viewMode',
      optionValues: ['luminance', 'rgb', 'channels'],
      correctOption: 'luminance',
    },
    {
      id: 'hist-intermediate-1',
      difficulty: 'intermediate',
      targetField: 'diagnosis',
      optionValues: ['red-clip', 'overexposed', 'wb'],
      correctOption: 'red-clip',
    },
    {
      id: 'hist-intermediate-2',
      difficulty: 'intermediate',
      targetField: 'action',
      optionValues: ['increase', 'fine', 'decrease'],
      correctOption: 'fine',
    },
    {
      id: 'hist-advanced-1',
      difficulty: 'advanced',
      targetField: 'technique',
      optionValues: ['bracket', 'midtones', 'bw'],
      correctOption: 'bracket',
    },
  ],
}
