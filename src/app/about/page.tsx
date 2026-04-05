import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.about')
  return {
    title: t('title'),
    description: t('description'),
    alternates: { canonical: 'https://www.phototools.io/about' },
  }
}

export default async function AboutPage() {
  const t = await getTranslations('about')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About PhotoTools',
    url: 'https://www.phototools.io/about',
  }

  return (
    <div
      style={{
        padding: 'var(--space-xl) var(--space-md)',
        maxWidth: 800,
        margin: '0 auto',
        overflowY: 'auto',
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
        {t('title')}
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)' }}>
        {t('subtitle')}
      </p>

      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
          {t('sections.whatIs.title')}
        </h2>
        <p>
          {t('sections.whatIs.body')}
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
          {t('sections.whoIsItFor.title')}
        </h2>
        <p>
          {t('sections.whoIsItFor.body')}
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
          {t('sections.privacyFirst.title')}
        </h2>
        <p>
          {t('sections.privacyFirst.body')}
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
          {t('sections.builtBy.title')}
        </h2>
        <p>
          {t('sections.builtBy.body')}
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
          {t('sections.getInTouch.title')}
        </h2>
        <p>
          {t.rich('sections.getInTouch.body', {
            contactLink: (chunks) => (
              <a href="/contact" style={{ color: 'var(--accent)' }}>
                {chunks}
              </a>
            ),
          })}
        </p>
      </section>
    </div>
  )
}
