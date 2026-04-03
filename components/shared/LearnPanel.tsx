'use client'

import { useState, useCallback, useEffect } from 'react'
import { getEducationBySlug, isChallengeComplete, markChallengeComplete } from '@/lib/data/education'
import type { Challenge } from '@/lib/data/education/types'
import styles from './LearnPanel.module.css'

interface LearnPanelProps {
  slug: string
}

export function LearnPanel({ slug }: LearnPanelProps) {
  const edu = getEducationBySlug(slug)
  const [collapsed, setCollapsed] = useState(false)
  const [challengeIndex, setChallengeIndex] = useState(0)

  if (!edu) return null

  if (collapsed) {
    return (
      <div className={styles.collapsed}>
        <button className={styles.reopenBtn} onClick={() => setCollapsed(false)} aria-label="Open learn panel">
          Learn
        </button>
      </div>
    )
  }

  const challenge = edu.challenges[challengeIndex]

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.headerTitle}>Learn</span>
        <span className={styles.spacer} />
        <button className={styles.closeBtn} onClick={() => setCollapsed(true)} aria-label="Collapse learn panel">
          &times;
        </button>
      </div>

      {/* Beginner explanation */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>What is this?</h3>
        <p className={styles.sectionText}>{edu.beginner}</p>
      </div>

      {/* Deeper explanation */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>How it works</h3>
        <p className={styles.sectionText}>{edu.deeper}</p>
      </div>

      {/* Key factors */}
      {edu.keyFactors && edu.keyFactors.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Key factors</h3>
          <div className={styles.factors}>
            {edu.keyFactors.map((f, i) => (
              <div key={i} className={styles.factor}>
                <span className={styles.factorLabel}>{f.label}</span> — {f.description}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pro tips */}
      {edu.tips.map((tip, i) => (
        <div key={i} className={styles.tip}>
          <div className={styles.tipLabel}>Pro Tip</div>
          <div className={styles.tipText}>{tip.text}</div>
        </div>
      ))}

      {/* Challenge section */}
      {challenge && (
        <>
          <div className={styles.challengeNav}>
            {edu.challenges.map((c, i) => (
              <ChallengeNavDot
                key={c.id}
                index={i}
                challengeId={c.id}
                active={i === challengeIndex}
                onClick={() => setChallengeIndex(i)}
              />
            ))}
          </div>
          <ChallengeCard challenge={challenge} />
        </>
      )}
    </div>
  )
}

function ChallengeNavDot({ index, challengeId, active, onClick }: { index: number; challengeId: string; active: boolean; onClick: () => void }) {
  const [complete, setComplete] = useState(false)

  useEffect(() => {
    setComplete(isChallengeComplete(challengeId))
  }, [challengeId])

  let className = styles.challengeNavDot
  if (active) className += ' ' + styles.challengeNavDotActive
  if (complete) className += ' ' + styles.challengeNavDotComplete

  return (
    <button className={className} onClick={onClick} aria-label={`Challenge ${index + 1}`}>
      {complete ? '✓' : index + 1}
    </button>
  )
}

function ChallengeCard({ challenge }: { challenge: Challenge }) {
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
    }
  }, [selected, challenge])

  return (
    <div className={styles.challenge}>
      <div className={styles.challengeHeader}>
        <span className={styles.challengeIcon}>⚡</span>
        <span className={styles.challengeLabel}>Challenge</span>
        <span className={styles.challengeDifficulty}>{challenge.difficulty}</span>
      </div>
      <div className={styles.challengeScenario}>{challenge.scenario}</div>
      {challenge.hint && <div className={styles.challengeHint}>Hint: {challenge.hint}</div>}

      {completed && !result && (
        <div className={styles.completedBadge}>✓ Completed</div>
      )}

      {challenge.options && (
        <div className={styles.challengeOptions}>
          {challenge.options.map((opt) => {
            let cls = styles.challengeOption
            if (result && opt.value === challenge.correctOption) {
              cls += ' ' + styles.challengeOptionCorrect
            } else if (result === 'failure' && opt.value === selected) {
              cls += ' ' + styles.challengeOptionWrong
            } else if (!result && opt.value === selected) {
              cls += ' ' + styles.challengeOptionSelected
            }
            return (
              <button
                key={opt.value}
                className={cls}
                onClick={() => { if (!result) setSelected(opt.value) }}
                disabled={result !== null}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      )}

      {!result && challenge.options && (
        <button className={styles.checkBtn} onClick={check} disabled={!selected}>
          Check Answer
        </button>
      )}

      {result === 'success' && <div className={styles.feedbackSuccess}>{challenge.successMessage}</div>}
      {result === 'failure' && <div className={styles.feedbackFailure}>{challenge.failureMessage}</div>}
    </div>
  )
}
