import Link from 'next/link'
import { getLiveTools } from '@/lib/data/tools'
import { ToolIcon } from '@/components/shared/ToolIcon'
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
          <div className={styles.grid}>
            {group.tools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className={styles.card}
              >
                <div className={styles.cardHeader}>
                  <ToolIcon slug={tool.slug} className={styles.cardIcon} />
                  <h3 className={styles.cardName}>{tool.name}</h3>
                </div>
                <span className={styles.cardDesc}>{tool.description}</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </main>
  )
}
