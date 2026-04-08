import type { ToolEducationSkeleton } from './types'

export const MEGAPIXEL_VISUALIZER_SKELETON: ToolEducationSkeleton = {
  slug: 'megapixel-visualizer',
  deeperSections: 4,
  keyFactorCount: 5,
  tipCount: 3,
  tooltipKeys: [
    'Megapixels', 'Aspect Ratio', 'DPI', 'Units',
    'Viewing Distance', 'Print Size', 'Bit Depth', 'Crop Reach',
  ],
  challenges: [
    { id: 'mp-beginner-1',     difficulty: 'beginner',     targetField: 'mp',  optionValues: ['6000x4000', '5657x4243', '6532x3674'], correctOption: '6000x4000' },
    { id: 'mp-beginner-2',     difficulty: 'beginner',     targetField: 'mp',  optionValues: ['20x13', '17x11', '13x9'],                correctOption: '20x13' },
    { id: 'mp-intermediate-1', difficulty: 'intermediate', targetField: 'mp',  optionValues: ['12', '24', '48'],                        correctOption: '12' },
    { id: 'mp-intermediate-2', difficulty: 'intermediate', targetField: 'dpi', optionValues: ['60', '150', '300'],                      correctOption: '60' },
    { id: 'mp-advanced-1',     difficulty: 'advanced',     targetField: 'mp',  optionValues: ['30', '20', '15'],                        correctOption: '20' },
  ],
}
