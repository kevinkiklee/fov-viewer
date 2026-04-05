'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { getVisibleTools, getToolStatus } from '@/lib/data/tools'
import type { ToolCategory } from '@/lib/types'
import { ToolIcon } from '@/components/shared/ToolIcon'
import { ThemeToggle } from './ThemeToggle'
import styles from './Nav.module.css'

interface NavProps {
  theme: string
  onThemeChange: (theme: 'dark' | 'light') => void
}

function useCategoryLabels(): Record<ToolCategory, string> {
  const t = useTranslations('common.nav.categories')
  return {
    visualizer: t('visualizer'),
    calculator: t('calculator'),
    reference: t('reference'),
    'file-tool': t('file-tool'),
  }
}

const CATEGORY_ORDER: ToolCategory[] = ['file-tool', 'visualizer', 'calculator', 'reference']

function useCanHover() {
  const [canHover, setCanHover] = useState(false)
  useEffect(() => {
    setCanHover(window.matchMedia('(hover: hover)').matches)
  }, [])
  return canHover
}

export function Nav({ theme, onThemeChange }: NavProps) {
  const t = useTranslations('common.nav')
  const CATEGORY_LABELS = useCategoryLabels()
  const [toolsOpen, setToolsOpen] = useState(false)
  const toolsRef = useRef<HTMLDivElement>(null)
  const canHover = useCanHover()
  const pathname = usePathname()
  const tools = getVisibleTools()

  const MAX_PER_COLUMN = 5

  const grouped = CATEGORY_ORDER.flatMap((cat) => {
    const catTools = tools
      .filter((t) => t.category === cat)
      .sort((a, b) => {
        const aLive = getToolStatus(a) === 'live' ? 0 : 1
        const bLive = getToolStatus(b) === 'live' ? 0 : 1
        return aLive - bLive
      })
    if (catTools.length === 0) return []
    if (catTools.length <= MAX_PER_COLUMN) {
      return [{ category: cat, label: CATEGORY_LABELS[cat], tools: catTools }]
    }
    const mid = Math.ceil(catTools.length / 2)
    return [
      { category: `${cat}-1` as ToolCategory, label: CATEGORY_LABELS[cat], tools: catTools.slice(0, mid) },
      { category: `${cat}-2` as ToolCategory, label: '', tools: catTools.slice(mid) },
    ]
  })

  // Close menu on route change (covers all navigation, including mobile)
  useEffect(() => {
    setToolsOpen(false)
  }, [pathname])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        setToolsOpen(false)
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setToolsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  return (
    <nav className={styles.nav}>
      <div className={styles.navInner}>
        <Link href="/" className={styles.logo}>Photo<span className={styles.logoAccent}>Tools</span></Link>
        <div
          className={styles.dropdownWrapper}
          ref={toolsRef}
          onMouseEnter={canHover ? () => setToolsOpen(true) : undefined}
          onMouseLeave={canHover ? () => setToolsOpen(false) : undefined}
        >
          <button
            className={`${styles.dropdownButton} ${toolsOpen ? styles.dropdownButtonActive : ''}`}
            onClick={() => setToolsOpen((v) => !v)}
            aria-expanded={toolsOpen}
            aria-haspopup="true"
          >
            {t('tools')} {toolsOpen ? '\u25B2' : '\u25BC'}
          </button>
          <AnimatePresence>
            {toolsOpen && (
              <motion.div
                className={`${styles.megaMenu} ${styles.megaMenuOpen}`}
                style={{ '--mega-cols': grouped.length } as React.CSSProperties}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <button
                  className={styles.megaCloseBtn}
                  onClick={() => setToolsOpen(false)}
                  aria-label={t('closeMenu')}
                >
                  &times;
                </button>
                {grouped.map((group) => (
                  <div key={group.category} className={styles.megaColumn}>
                    <div className={styles.megaCategoryLabel}>{group.label || '\u00A0'}</div>
                    {group.tools.map((tool) => {
                      const isLive = getToolStatus(tool) === 'live'
                      if (isLive) {
                        return (
                          <Link
                            key={tool.slug}
                            href={`/${tool.slug}`}
                            className={styles.megaItem}
                            onClick={(e) => { if (!e.metaKey && !e.ctrlKey) setToolsOpen(false) }}
                          >
                            <span className={styles.megaItemHeader}>
                              <ToolIcon slug={tool.slug} width={16} height={16} className={styles.megaItemIcon} />
                              <span className={styles.megaItemName}>{tool.name}</span>
                            </span>
                            <span className={styles.megaItemDesc}>{tool.description}</span>
                          </Link>
                        )
                      }
                      return (
                        <div key={tool.slug} className={`${styles.megaItem} ${styles.megaItemDisabled}`}>
                          <span className={styles.megaItemHeader}>
                            <ToolIcon slug={tool.slug} width={16} height={16} className={styles.megaItemIcon} />
                            <span className={styles.megaItemName}>{tool.name}</span>
                            <span className={styles.megaItemBadge}>{t('comingSoon')}</span>
                          </span>
                          <span className={styles.megaItemDesc}>{tool.description}</span>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <Link href="/learn/glossary" className={styles.navLink}>{t('glossary')}</Link>
        <span className={styles.desktopThemeToggle}><ThemeToggle theme={theme} onChange={onThemeChange} /></span>
        <div className={styles.spacer} />
      </div>
    </nav>
  )
}
