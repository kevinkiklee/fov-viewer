import Link from 'next/link'
import { getVisibleTools, getToolStatus } from '@/lib/data/tools'
import { ToolIcon } from '@/components/shared/ToolIcon'
import { AnimatedGrid, AnimatedItem } from '@/components/shared/AnimatedGrid'
import type { ToolCategory } from '@/lib/types'
import styles from './page.module.css'

const CATEGORIES: { key: ToolCategory; label: string }[] = [
  { key: 'visualizer', label: 'Visualizers' },
  { key: 'calculator', label: 'Calculators' },
  { key: 'reference', label: 'Reference' },
  { key: 'file-tool', label: 'File Tools' },
]

export default function HomePage() {
  const tools = getVisibleTools()

  const grouped = CATEGORIES
    .map((cat) => ({
      ...cat,
      tools: tools
        .filter((t) => t.category === cat.key)
        .sort((a, b) => {
          const aLive = getToolStatus(a) === 'live' ? 0 : 1
          const bLive = getToolStatus(b) === 'live' ? 0 : 1
          return aLive - bLive
        }),
    }))
    .filter((g) => g.tools.length > 0)

  return (
    <main className={styles.page}>
      <div className={styles.hero}>
        <h1 className="sr-only">PhotoTools — Free Photography Tools</h1>
        <p className={styles.heroDesc}>
          Free photography calculators, simulators, and references. No sign-up required — your photos never leave your browser.
        </p>
      </div>

      {grouped.map((group) => (
        <section key={group.key} className={styles.category}>
          <h2 className={styles.categoryLabel}>{group.label}</h2>
          <AnimatedGrid className={styles.grid}>
            {group.tools.map((tool) => {
              const isLive = getToolStatus(tool) === 'live'
              if (isLive) {
                return (
                  <AnimatedItem key={tool.slug}>
                    <Link
                      href={`/${tool.slug}`}
                      className={styles.card}
                    >
                      <div className={styles.cardHeader}>
                        <ToolIcon slug={tool.slug} className={styles.cardIcon} />
                        <h3 className={styles.cardName}>{tool.name}</h3>
                      </div>
                      <span className={styles.cardDesc}>{tool.description}</span>
                    </Link>
                  </AnimatedItem>
                )
              }
              return (
                <AnimatedItem key={tool.slug}>
                  <div className={`${styles.card} ${styles.cardDisabled}`}>
                    <div className={styles.cardHeader}>
                      <ToolIcon slug={tool.slug} className={styles.cardIcon} />
                      <h3 className={styles.cardName}>{tool.name}</h3>
                      <span className={styles.cardBadge}>Coming Soon</span>
                    </div>
                    <span className={styles.cardDesc}>{tool.description}</span>
                  </div>
                </AnimatedItem>
              )
            })}
          </AnimatedGrid>
        </section>
      ))}
    </main>
  )
}
