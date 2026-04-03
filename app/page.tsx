import Link from 'next/link'
import { getLiveTools } from '@/lib/data/tools'

export default function HomePage() {
  const tools = getLiveTools()
  return (
    <div style={{ padding: '16px', width: '100%' }}>
      <h1 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Photo Tools</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 24 }}>
        Free photography calculators, simulators, and references.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8 }}>
        {tools.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            style={{
              display: 'block',
              padding: 14,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{tool.name}</h2>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{tool.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
