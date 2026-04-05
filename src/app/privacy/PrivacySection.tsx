import type { ReactNode } from 'react'

export function PrivacySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ marginBottom: 'var(--space-xl)' }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
        {title}
      </h2>
      {children}
    </section>
  )
}

export function SectionParagraph({ children }: { children: ReactNode }) {
  return <p style={{ marginTop: 'var(--space-sm)' }}>{children}</p>
}
