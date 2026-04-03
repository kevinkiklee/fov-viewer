import type { Metadata } from 'next'
import { Glossary } from '@/components/tools/glossary/Glossary'

export const metadata: Metadata = {
  title: 'Photography Glossary',
  description: 'Searchable glossary of 50+ photography terms with definitions and links to interactive tools.',
}

export default function GlossaryPage() {
  return (
    <div style={{ padding: 'var(--space-xl) var(--space-md)', maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 'var(--space-sm)' }}>Photography Glossary</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)' }}>
        Searchable reference of photography terms. Click any term to see its definition.
      </p>
      <Glossary />
    </div>
  )
}
