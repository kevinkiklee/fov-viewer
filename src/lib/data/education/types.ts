export interface Tooltip {
  term: string
  definition: string
}

export interface ProTip {
  text: string
}

export interface ChallengeOption {
  label: string
  value: string
}

export interface Challenge {
  id: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  scenario: string
  hint?: string
  successMessage: string
  failureMessage: string
  /** The control field name the user should adjust */
  targetField: string
  /** Accepted values or range for validation */
  acceptedValues?: string[]
  /** For numeric range validation */
  acceptedRange?: { min: number; max: number }
  /** Multiple choice options (if the challenge is pick-the-right-answer) */
  options?: ChallengeOption[]
  /** The correct option value */
  correctOption?: string
}

export interface ToolEducation {
  slug: string
  /** Short beginner-friendly explanation */
  beginner: string
  /** Deeper explanation for intermediate users — plain string or headed sections */
  deeper: string | { heading: string; text: string }[]
  /** Key factors / bullet points */
  keyFactors?: { label: string; description: string }[]
  /** Pro tips with amber callout styling */
  tips: ProTip[]
  /** Tooltips for control labels */
  tooltips: Record<string, Tooltip>
  /** Progressive challenges */
  challenges: Challenge[]
}

// ── Skeleton types for i18n ─────────────────────────────────────────
// Non-translatable challenge data kept in TS; translatable strings come from JSON

export interface ChallengeSkeleton {
  id: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  targetField: string
  acceptedValues?: string[]
  acceptedRange?: { min: number; max: number }
  /** Option values only — labels come from translation JSON */
  optionValues?: string[]
  correctOption?: string
}

export interface ToolEducationSkeleton {
  slug: string
  /** Whether deeper is a single string or an array of sections */
  deeperSections?: number
  /** Tooltip keys (code identifiers, not translatable) */
  tooltipKeys: string[]
  /** Number of key factors */
  keyFactorCount: number
  /** Number of pro tips */
  tipCount: number
  /** Challenge skeletons with non-translatable data */
  challenges: ChallengeSkeleton[]
}

export interface ChallengeProgress {
  [challengeId: string]: {
    completed: boolean
    completedAt: string
  }
}
