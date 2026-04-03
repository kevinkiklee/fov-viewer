'use client'

import { useState, useMemo, useCallback, useRef } from 'react'
import { GLOSSARY } from '@/lib/data/glossary'
import { TOOLS } from '@/lib/data/tools'
import styles from './Glossary.module.css'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

function getToolName(slug: string): string {
  const tool = TOOLS.find((t) => t.slug === slug)
  return tool?.name ?? slug
}

export function Glossary() {
  const [query, setQuery] = useState('')
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return GLOSSARY
    return GLOSSARY.filter(
      (entry) =>
        entry.term.toLowerCase().includes(q) ||
        entry.definition.toLowerCase().includes(q),
    )
  }, [query])

  const grouped = useMemo(() => {
    const groups: Record<string, typeof GLOSSARY> = {}
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
        placeholder="Search terms..."
        aria-label="Search glossary terms"
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
        <div className={styles.noResults}>No terms match your search.</div>
      )}

      {LETTERS.filter((l) => grouped[l]).map((letter) => (
        <div
          key={letter}
          className={styles.section}
          ref={(el) => { sectionRefs.current[letter] = el }}
        >
          <div className={styles.sectionLetter}>{letter}</div>
          {grouped[letter].map((entry) => (
            <div key={entry.term} className={styles.termItem}>
              <div className={styles.termName}>{entry.term}</div>
              <div className={styles.termDef}>{entry.definition}</div>
              {entry.relatedTool && (
                <a className={styles.toolLink} href={`/tools/${entry.relatedTool}`}>
                  Try the {getToolName(entry.relatedTool)} &rarr;
                </a>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
