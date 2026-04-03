import Link from 'next/link'
import { getLiveTools } from '@/lib/data/tools'
import type { ToolCategory } from '@/lib/types'
import styles from './page.module.css'

const CATEGORIES: { key: ToolCategory; label: string }[] = [
  { key: 'visualizer', label: 'Visualizers' },
  { key: 'calculator', label: 'Calculators' },
  { key: 'reference', label: 'Reference' },
  { key: 'file-tool', label: 'File Tools' },
]

export default function HomePage() {
  const tools = getLiveTools()

  const grouped = CATEGORIES
    .map((cat) => ({
      ...cat,
      tools: tools.filter((t) => t.category === cat.key),
    }))
    .filter((g) => g.tools.length > 0)

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>
          Photo<span className={styles.heroAccent}>Tools</span>
        </h1>
        <p className={styles.heroDesc}>
          Free photography calculators, simulators, and references. No sign-up, no tracking, runs entirely in your browser.
        </p>
      </div>

      {grouped.map((group) => (
        <div key={group.key} className={styles.category}>
          <div className={styles.categoryLabel}>{group.label}</div>
          <div className={styles.grid}>
            {group.tools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className={styles.card}
              >
                <span className={styles.cardName}>{tool.name}</span>
                <span className={styles.cardDesc}>{tool.description}</span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
