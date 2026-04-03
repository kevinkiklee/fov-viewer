'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { getLiveTools } from '@/lib/data/tools'
import type { ToolCategory } from '@/lib/types'
import { ToolIcon } from '@/components/shared/ToolIcon'
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
      <div className={styles.navInner}>
        <Link href="/" className={styles.logo}>Photo<span className={styles.logoAccent}>Tools</span></Link>
        <div
          className={styles.dropdownWrapper}
          ref={toolsRef}
          onMouseEnter={() => setToolsOpen(true)}
          onMouseLeave={() => setToolsOpen(false)}
        >
          <button
            className={`${styles.dropdownButton} ${toolsOpen ? styles.dropdownButtonActive : ''}`}
            onClick={() => setToolsOpen((v) => !v)}
            aria-expanded={toolsOpen}
            aria-haspopup="true"
          >
            Tools {toolsOpen ? '\u25B2' : '\u25BC'}
          </button>
          <div
            className={`${styles.megaMenu} ${toolsOpen ? styles.megaMenuOpen : ''}`}
            style={{ '--mega-cols': grouped.length } as React.CSSProperties}
          >
            {grouped.map((group) => (
              <div key={group.category} className={styles.megaColumn}>
                <div className={styles.megaCategoryLabel}>{group.label}</div>
                {group.tools.map((tool) => (
                  <Link
                    key={tool.slug}
                    href={`/tools/${tool.slug}`}
                    className={styles.megaItem}
                    onClick={(e) => { if (!e.metaKey && !e.ctrlKey) setToolsOpen(false) }}
                  >
                    <span className={styles.megaItemHeader}>
                      <ToolIcon slug={tool.slug} width={16} height={16} className={styles.megaItemIcon} />
                      <span className={styles.megaItemName}>{tool.name}</span>
                    </span>
                    <span className={styles.megaItemDesc}>{tool.description}</span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
        <Link href="/learn/glossary" className={styles.navLink}>Glossary</Link>
        <div className={styles.spacer} />
        <ThemeToggle theme={theme} onChange={onThemeChange} />
      </div>
    </nav>
  )
}
