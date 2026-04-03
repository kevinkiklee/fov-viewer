'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { getLiveTools } from '@/lib/data/tools'
import { ThemeToggle } from './ThemeToggle'
import styles from './Nav.module.css'

interface NavProps {
  theme: string
  onThemeChange: (theme: 'dark' | 'light') => void
}

export function Nav({ theme, onThemeChange }: NavProps) {
  const [toolsOpen, setToolsOpen] = useState(false)
  const [learnOpen, setLearnOpen] = useState(false)
  const toolsRef = useRef<HTMLDivElement>(null)
  const learnRef = useRef<HTMLDivElement>(null)
  const tools = getLiveTools()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        setToolsOpen(false)
      }
      if (learnRef.current && !learnRef.current.contains(e.target as Node)) {
        setLearnOpen(false)
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
          className={styles.dropdownButton}
          onClick={() => setToolsOpen((v) => !v)}
          aria-expanded={toolsOpen}
          aria-haspopup="true"
        >
          Tools {toolsOpen ? '\u25B2' : '\u25BC'}
        </button>
        {toolsOpen && (
          <div className={styles.dropdownMenu}>
            {tools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className={styles.dropdownItem}
                onClick={() => setToolsOpen(false)}
              >
                {tool.name}
              </Link>
            ))}
          </div>
        )}
      </div>
      <div className={styles.dropdownWrapper} ref={learnRef}>
        <button
          className={styles.dropdownButton}
          onClick={() => setLearnOpen((v) => !v)}
          aria-expanded={learnOpen}
          aria-haspopup="true"
        >
          Learn {learnOpen ? '\u25B2' : '\u25BC'}
        </button>
        {learnOpen && (
          <div className={styles.dropdownMenu}>
            <Link href="/learn/paths" className={styles.dropdownItem} onClick={() => setLearnOpen(false)}>
              Learning Paths
            </Link>
            <Link href="/learn/glossary" className={styles.dropdownItem} onClick={() => setLearnOpen(false)}>
              Glossary
            </Link>
          </div>
        )}
      </div>
      <div className={styles.spacer} />
      <ThemeToggle theme={theme} onChange={onThemeChange} />
    </nav>
  )
}
