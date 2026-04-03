'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { getLiveTools } from '@/lib/data/tools'
import type { ToolCategory } from '@/lib/types'
import { ThemeToggle } from './ThemeToggle'
import styles from './Nav.module.css'

interface NavProps {
  theme: string
  onThemeChange: (theme: 'dark' | 'light') => void
}

const CATEGORY_LABELS: Record<ToolCategory, string> = {
  visualizer: 'Visualizers',
  calculator: 'Calculators',
  reference: 'Reference',
  'file-tool': 'File Tools',
}

const CATEGORY_ORDER: ToolCategory[] = ['visualizer', 'calculator', 'reference', 'file-tool']

export function Nav({ theme, onThemeChange }: NavProps) {
  const [toolsOpen, setToolsOpen] = useState(false)
  const toolsRef = useRef<HTMLDivElement>(null)
  const tools = getLiveTools()

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    tools: tools.filter((t) => t.category === cat),
  })).filter((g) => g.tools.length > 0)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        setToolsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.logo}>PhotoTools</Link>
      <div className={styles.dropdownWrapper} ref={toolsRef}>
        <button
          className={`${styles.dropdownButton} ${toolsOpen ? styles.dropdownButtonActive : ''}`}
          onClick={() => setToolsOpen((v) => !v)}
          aria-expanded={toolsOpen}
          aria-haspopup="true"
        >
          Tools {toolsOpen ? '\u25B2' : '\u25BC'}
        </button>
        {toolsOpen && (
          <div className={styles.megaMenu}>
            {grouped.map((group) => (
              <div key={group.category} className={styles.megaColumn}>
                <div className={styles.megaCategoryLabel}>{group.label}</div>
                {group.tools.map((tool) => (
                  <Link
                    key={tool.slug}
                    href={`/tools/${tool.slug}`}
                    className={styles.megaItem}
                    onClick={() => setToolsOpen(false)}
                  >
                    <span className={styles.megaItemName}>{tool.name}</span>
                    <span className={styles.megaItemDesc}>{tool.description}</span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
      <Link href="/learn/glossary" className={styles.navLink}>Glossary</Link>
      <div className={styles.spacer} />
      <ThemeToggle theme={theme} onChange={onThemeChange} />
    </nav>
  )
}
