import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { ContactForm } from './_components/ContactForm'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.contact')
  return {
    title: t('title'),
    description: t('description'),
    alternates: { canonical: 'https://www.phototools.io/contact' },
  }
}

export default async function ContactPage() {
  const t = await getTranslations('contact')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact PhotoTools',
    url: 'https://www.phototools.io/contact',
  }

  return (
    <div style={{ padding: 'var(--space-xl) var(--space-md)', maxWidth: 800, margin: '0 auto', overflowY: 'auto' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 'var(--space-sm)' }}>{t('title')}</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)' }}>
        {t('description')}
      </p>
      <ContactForm />
    </div>
  )
}
