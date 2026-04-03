'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getLearningPaths, getPathProgress, isChallengeComplete } from '@/lib/data/education'
import { getToolBySlug } from '@/lib/data/tools'
import type { LearningPath } from '@/lib/data/education/types'
import styles from './LearningPaths.module.css'

export function LearningPaths() {
  const paths = getLearningPaths()
  const [, setTick] = useState(0)

  // Re-render when localStorage changes (e.g., challenge completed in another tab)
  useEffect(() => {
    const handler = () => setTick((t) => t + 1)
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>Learning Paths</h1>
      <p className={styles.subtitle}>
        Guided sequences of challenges across tools. Complete them in order to build your photography knowledge.
      </p>
      <div className={styles.paths}>
        {paths.map((path) => (
          <PathCard key={path.id} path={path} />
        ))}
      </div>
    </div>
  )
}

function PathCard({ path }: { path: LearningPath }) {
  const { completed, total } = getPathProgress(path.id)
  const pct = total > 0 ? (completed / total) * 100 : 0
  const allDone = completed === total

  return (
    <div className={styles.pathCard}>
      <div className={styles.pathHeader}>
        <h2 className={styles.pathName}>{path.name}</h2>
        <span className={`${styles.progressBadge} ${allDone ? styles.progressComplete : ''}`}>
          {completed}/{total} {allDone ? '✓ Complete' : ''}
        </span>
      </div>
      <p className={styles.pathDescription}>{path.description}</p>
      <div className={styles.progressBar}>
        <div
          className={`${styles.progressFill} ${allDone ? styles.progressFillComplete : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className={styles.steps}>
        {path.steps.map((step, i) => {
          const tool = getToolBySlug(step.toolSlug)
          const done = isChallengeComplete(step.challengeId)
          return (
            <div key={`${step.challengeId}-${i}`} className={styles.step}>
              <span className={`${styles.stepNumber} ${done ? styles.stepComplete : ''}`}>
                {done ? '✓' : i + 1}
              </span>
              <Link href={`/tools/${step.toolSlug}`} className={styles.stepToolLink}>
                {tool?.name ?? step.toolSlug}
              </Link>
              <span className={styles.stepContext}>— {step.context}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
