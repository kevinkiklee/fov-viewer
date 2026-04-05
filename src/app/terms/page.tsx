import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.terms')
  return {
    title: t('title'),
    description: t('description'),
    alternates: { canonical: 'https://www.phototools.io/terms' },
  }
}

export default async function TermsPage() {
  const t = await getTranslations('terms')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Terms of Service',
    url: 'https://www.phototools.io/terms',
  }

  const contactLink = (chunks: React.ReactNode) => (
    <a href="/contact" style={{ color: 'var(--accent)' }}>
      {chunks}
    </a>
  )

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
        {t('effectiveDate')}
      </p>

      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
          {t('sections.acceptance.title')}
        </h2>
        <p>
          {t('sections.acceptance.body')}
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
          {t('sections.descriptionOfService.title')}
        </h2>
        <p>
          {t('sections.descriptionOfService.body')}
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
          {t('sections.noWarranty.title')}
        </h2>
        <p>
          {t('sections.noWarranty.body')}
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
          {t('sections.intellectualProperty.title')}
        </h2>
        <p>
          {t('sections.intellectualProperty.body')}
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
          {t('sections.acceptableUse.title')}
        </h2>
        <p>{t('sections.acceptableUse.intro')}</p>
        <ul style={{ marginTop: 'var(--space-sm)', paddingLeft: 'var(--space-lg)' }}>
          <li>{t('sections.acceptableUse.items.laws')}</li>
          <li>{t('sections.acceptableUse.items.disrupt')}</li>
          <li>{t('sections.acceptableUse.items.scrape')}</li>
          <li>{t('sections.acceptableUse.items.misrepresent')}</li>
          <li>{t('sections.acceptableUse.items.commercial')}</li>
        </ul>
      </section>

      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
          {t('sections.thirdPartyContent.title')}
        </h2>
        <p>
          {t('sections.thirdPartyContent.body')}
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
          {t('sections.limitationOfLiability.title')}
        </h2>
        <p>
          {t('sections.limitationOfLiability.body')}
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
          {t('sections.changesToTerms.title')}
        </h2>
        <p>
          {t('sections.changesToTerms.body')}
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
          {t('sections.contact.title')}
        </h2>
        <p>
          {t.rich('sections.contact.body', { contactLink })}
        </p>
      </section>
    </div>
  )
}
