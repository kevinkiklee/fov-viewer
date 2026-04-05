import type { ToolEducationSkeleton } from './types'

export const FRAME_STUDIO_SKELETON: ToolEducationSkeleton = {
  slug: 'frame-studio',
  deeperSections: 3,
  keyFactorCount: 4,
  tipCount: 3,
  tooltipKeys: ['Aspect Ratio', 'Rule of Thirds', 'Golden Ratio', 'Border Width', 'Inner Mat', 'Corner Radius'],
  challenges: [
    {
      id: 'fs-beginner-1',
      difficulty: 'beginner',
      targetField: 'aspectRatio',
      optionValues: ['1:1', '4:5', '16:9'],
      correctOption: '4:5',
    },
    {
      id: 'fs-beginner-2',
      difficulty: 'beginner',
      targetField: 'grid',
      optionValues: ['rule-of-thirds', 'golden-spiral', 'diagonal-lines'],
      correctOption: 'rule-of-thirds',
    },
    {
      id: 'fs-intermediate-1',
      difficulty: 'intermediate',
      targetField: 'aspectRatio',
      optionValues: ['3:2', '5:4', '4:3'],
      correctOption: '5:4',
    },
    {
      id: 'fs-intermediate-2',
      difficulty: 'intermediate',
      targetField: 'grid',
      optionValues: ['center-cross', 'golden-spiral', 'square-grid'],
      correctOption: 'golden-spiral',
    },
    {
      id: 'fs-advanced-1',
      difficulty: 'advanced',
      targetField: 'preset',
      optionValues: ['none', 'white', 'black'],
      correctOption: 'white',
    },
  ],
}
