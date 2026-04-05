'use client'

import { useState, useCallback, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { isChallengeComplete, markChallengeComplete } from '@/lib/data/education'
import type { ChallengeSkeleton } from '@/lib/data/education/types'
import styles from './LearnPanel.module.css'

export function ChallengeNavDot({ index, complete, active, onClick }: {
  index: number; complete: boolean; active: boolean; onClick: () => void
}) {
  const t = useTranslations('common.learn')
  let className = styles.challengeNavDot
  if (active) className += ' ' + styles.challengeNavDotActive
  if (complete) className += ' ' + styles.challengeNavDotComplete

  return (
    <button className={className} onClick={onClick} aria-label={t('challengeNumber', { number: index + 1 })}>
      {complete ? '✓' : index + 1}
    </button>
  )
}

interface ChallengeCardProps {
  challenge: ChallengeSkeleton
  challengeIndex: number
  et: ReturnType<typeof useTranslations>
  onAdvance?: () => void
  onComplete?: (id: string) => void
  children?: React.ReactNode
}

export function ChallengeCard({ challenge, challengeIndex, et, onAdvance, onComplete, children }: ChallengeCardProps) {
  const t = useTranslations('common.learn')
  const [selected, setSelected] = useState<string | null>(null)
  const [result, setResult] = useState<'success' | 'failure' | null>(null)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    setSelected(null)
    setResult(null)
    setCompleted(isChallengeComplete(challenge.id))
  }, [challenge.id])

  const check = useCallback(() => {
    if (!selected) return
    const correct = challenge.correctOption === selected
    setResult(correct ? 'success' : 'failure')
    if (correct) {
      markChallengeComplete(challenge.id)
      setCompleted(true)
      onComplete?.(challenge.id)
    }
  }, [selected, challenge, onComplete])

  return (
    <div className={styles.challenge}>
      <div className={styles.challengeHeader}>
        <span className={styles.challengeIcon}>⚡</span>
        <span className={styles.challengeLabel}>{t('challenge')}</span>
        <span className={styles.challengeDifficulty}>{challenge.difficulty}</span>
      </div>
      {children}
      <div className={styles.challengeScenario}>{et(`challenges.${challengeIndex}.scenario`)}</div>
      {challenge.optionValues && (
        <div className={styles.challengeHint}>{t('hint', { hint: et(`challenges.${challengeIndex}.hint`) })}</div>
      )}

      {completed && !result && (
        <div className={styles.completedBadge}>✓ {t('completed')}</div>
      )}

      {challenge.optionValues && (
        <div className={styles.challengeOptions}>
          {challenge.optionValues.map((value, optIndex) => {
            let cls = styles.challengeOption
            if (result && value === challenge.correctOption) {
              cls += ' ' + styles.challengeOptionCorrect
            } else if (result === 'failure' && value === selected) {
              cls += ' ' + styles.challengeOptionWrong
            } else if (!result && value === selected) {
              cls += ' ' + styles.challengeOptionSelected
            }
            return (
              <button key={value} className={cls}
                onClick={() => { if (!result) setSelected(value) }}
                disabled={result !== null}>
                {et(`challenges.${challengeIndex}.options.${optIndex}.label`)}
              </button>
            )
          })}
        </div>
      )}

      {!result && challenge.optionValues && (
        <button className={styles.checkBtn} onClick={check} disabled={!selected}>
          {t('checkAnswer')}
        </button>
      )}

      {result === 'success' && (
        <>
          <div className={styles.feedbackSuccess}>{et(`challenges.${challengeIndex}.successMessage`)}</div>
          {onAdvance && (
            <button className={styles.checkBtn} onClick={onAdvance}>
              {t('nextChallenge')} &rarr;
            </button>
          )}
        </>
      )}
      {result === 'failure' && (
        <>
          <div className={styles.feedbackFailure}>{et(`challenges.${challengeIndex}.failureMessage`)}</div>
          <button className={styles.retryBtn} onClick={() => { setSelected(null); setResult(null) }}>
            {t('tryAgain')}
          </button>
        </>
      )}
    </div>
  )
}
