'use client'

import { useState, useMemo, useCallback, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { GLOSSARY } from '@/lib/data/glossary'
import { getLiveTools } from '@/lib/data/tools'
import styles from './Glossary.module.css'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

const LIVE_TOOLS = getLiveTools()
const LIVE_SLUGS = new Set(LIVE_TOOLS.map((t) => t.slug))

function getToolName(slug: string): string {
  const tool = LIVE_TOOLS.find((t) => t.slug === slug)
  return tool?.name ?? slug
}

interface ResolvedEntry {
  id: string
  term: string
  definition: string
  relatedTool?: string
}

export function Glossary() {
  const t = useTranslations('glossary')

  const entries: ResolvedEntry[] = useMemo(
    () =>
      GLOSSARY.map((e) => ({
        id: e.id,
        term: t(`entries.${e.id}.term` as Parameters<typeof t>[0]),
        definition: t(`entries.${e.id}.definition` as Parameters<typeof t>[0]),
        relatedTool: e.relatedTool,
      })),
    [t],
  )

  const [query, setQuery] = useState('')
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return entries
    return entries.filter(
      (entry) =>
        entry.term.toLowerCase().includes(q) ||
        entry.definition.toLowerCase().includes(q),
    )
  }, [query, entries])

  const grouped = useMemo(() => {
    const groups: Record<string, ResolvedEntry[]> = {}
    for (const entry of filtered) {
      const letter = entry.term[0].toUpperCase()
      if (!groups[letter]) groups[letter] = []
      groups[letter].push(entry)
    }
    return groups
  }, [filtered])

  const activeLetters = useMemo(() => new Set(Object.keys(grouped)), [grouped])

  const scrollToLetter = useCallback((letter: string) => {
    sectionRefs.current[letter]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    <div>
      <input
        className={styles.search}
        type="text"
        placeholder={t('searchPlaceholder')}
        aria-label={t('searchAriaLabel')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className={styles.alphabet}>
        {LETTERS.map((letter) => {
          const active = activeLetters.has(letter)
          return (
            <button
              key={letter}
              className={`${styles.letterBtn} ${!active ? styles.letterBtnDisabled : ''}`}
              onClick={() => active && scrollToLetter(letter)}
              disabled={!active}
            >
              {letter}
            </button>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className={styles.noResults}>{t('noResults')}</div>
      )}

      {LETTERS.filter((l) => grouped[l]).map((letter) => (
        <div
          key={letter}
          className={styles.section}
          ref={(el) => { sectionRefs.current[letter] = el }}
        >
          <div className={styles.sectionLetter}>{letter}</div>
          {grouped[letter].map((entry) => (
            <div key={entry.id} className={styles.termItem}>
              <div className={styles.termName}>{entry.term}</div>
              <div className={styles.termDef}>{entry.definition}</div>
              {entry.relatedTool && LIVE_SLUGS.has(entry.relatedTool) && (
                <a className={styles.toolLink} href={`/${entry.relatedTool}`}>
                  {t('tryTool', { toolName: getToolName(entry.relatedTool) })} &rarr;
                </a>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
