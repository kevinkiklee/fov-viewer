import type { ToolEducationSkeleton } from './types'

export const DOF_CALCULATOR_SKELETON: ToolEducationSkeleton = {
  slug: 'dof-calculator',
  keyFactorCount: 4,
  tipCount: 3,
  tooltipKeys: ['focalLength', 'aperture', 'subjectDistance', 'sensor', 'nearFocus', 'farFocus', 'totalDoF', 'hyperfocal'],
  challenges: [
    {
      id: 'dof-portrait-blur',
      difficulty: 'beginner',
      targetField: 'aperture',
      optionValues: ['f/1.8', 'f/5.6', 'f/11', 'f/16'],
      correctOption: 'f/1.8',
    },
    {
      id: 'dof-group-photo',
      difficulty: 'beginner',
      targetField: 'aperture',
      optionValues: ['f/1.4', 'f/2.8', 'f/5.6', 'f/22'],
      correctOption: 'f/5.6',
    },
    {
      id: 'dof-landscape-sharp',
      difficulty: 'intermediate',
      targetField: 'subjectDistance',
      optionValues: ['flowers', 'infinity', 'hyperfocal', 'halfway'],
      correctOption: 'hyperfocal',
    },
    {
      id: 'dof-macro-challenge',
      difficulty: 'intermediate',
      targetField: 'aperture',
      optionValues: ['f/2.8', 'f/11', 'wider-lens', 'move-back'],
      correctOption: 'f/11',
    },
    {
      id: 'dof-sensor-comparison',
      difficulty: 'advanced',
      targetField: 'sensor',
      optionValues: ['full-frame', 'mft', 'same'],
      correctOption: 'full-frame',
    },
  ],
}
