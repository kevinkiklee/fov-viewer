import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getVisibleTools, getToolStatus } from '@/lib/data/tools'
import { ToolIcon } from '@/components/shared/ToolIcon'
import { AnimatedGrid, AnimatedItem } from '@/components/shared/AnimatedGrid'
import type { ToolCategory } from '@/lib/types'
import { AdUnit } from '@/components/shared/AdUnit'
import styles from './page.module.css'

const CATEGORY_KEYS: ToolCategory[] = ['visualizer', 'calculator', 'reference', 'file-tool']

export default async function HomePage() {
  const t = await getTranslations('home')
  const tools = getVisibleTools()

  const grouped = CATEGORY_KEYS
    .map((key) => ({
      key,
      label: t(`categories.${key}`),
      tools: tools
        .filter((tool) => tool.category === key)
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
        <h1 className="sr-only">{t('heroTitle')}</h1>
        <p className={styles.heroDesc}>
          {t('heroDesc')}
        </p>
      </div>

      <AdUnit slot="" format="leaderboard" channel="homepage_leaderboard" className={styles.homepageAd} />

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
                      <span className={styles.cardBadge}>{t('comingSoon')}</span>
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
