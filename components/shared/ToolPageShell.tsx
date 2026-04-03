'use client'

import { getToolBySlug } from '@/lib/data/tools'
import { DraftBanner } from './DraftBanner'
import type { ReactNode } from 'react'

interface ToolPageShellProps {
  slug: string
  children: ReactNode
}

export function ToolPageShell({ slug, children }: ToolPageShellProps) {
  const tool = getToolBySlug(slug)
  return (
    <>
      {tool?.status === 'draft' && <DraftBanner />}
      <div style={{ padding: '16px', width: '100%' }}>
        {tool && (
          <div style={{ marginBottom: '16px' }}>
            <h1 style={{ fontSize: '14px', fontWeight: 600 }}>{tool.name}</h1>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{tool.description}</p>
          </div>
        )}
        {children}
      </div>
    </>
  )
}
