'use client'

import { getToolBySlug } from '@/lib/data/tools'
import { DraftBanner } from './DraftBanner'
import { ToolActions } from './ToolActions'
import { LearnPanel } from './LearnPanel'
import type { ReactNode } from 'react'
import styles from './ToolPageShell.module.css'

interface ToolPageShellProps {
  slug: string
  children: ReactNode
}

export function ToolPageShell({ slug, children }: ToolPageShellProps) {
  const tool = getToolBySlug(slug)
  return (
    <>
      {tool?.status === 'draft' && <DraftBanner />}
      <div className={styles.outer}>
        <div className={styles.main}>
          {tool && (
            <div className={styles.header}>
              <h1 className={styles.title}>{tool.name}</h1>
              <p className={styles.description}>{tool.description}</p>
              <ToolActions toolName={tool.name} toolSlug={tool.slug} />
            </div>
          )}
          {children}
        </div>
        <LearnPanel slug={slug} />
      </div>
    </>
  )
}
