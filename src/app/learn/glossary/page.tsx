import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Glossary } from './_components/Glossary'
import { GLOSSARY } from '@/lib/data/glossary'
import { AdUnit } from '@/components/shared/AdUnit'
import styles from './page.module.css'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.glossary')
  return { title: t('title'), description: t('description') }
}

export default async function GlossaryPage() {
  const t = await getTranslations('glossary')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: GLOSSARY.map((entry) => ({
      '@type': 'Question',
      name: `What is ${t(`entries.${entry.id}.term` as Parameters<typeof t>[0])} in photography?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: t(`entries.${entry.id}.definition` as Parameters<typeof t>[0]),
      },
    })),
  }

  return (
    <div className={styles.outer}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className={styles.main}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 'var(--space-sm)' }}>{t('title')}</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)' }}>
          {t('subtitle')}
        </p>
        <Glossary />
      </div>
      <div className={styles.sidebar}>
        <AdUnit slot="" format="rectangle" channel="glossary_sidebar" />
      </div>
    </div>
  )
}
