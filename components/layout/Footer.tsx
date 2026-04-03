import Link from 'next/link'
import { getLiveTools } from '@/lib/data/tools'
import styles from './Footer.module.css'

export function Footer() {
  const tools = getLiveTools()
  return (
    <footer className={styles.footer}>
      <div className={styles.links}>
        {tools.map((tool) => (
          <Link key={tool.slug} href={`/tools/${tool.slug}`} className={styles.link}>
            {tool.name}
          </Link>
        ))}
        <Link href="/learn/glossary" className={styles.link}>Glossary</Link>
      </div>
      <p>&copy; {new Date().getFullYear()} Photo Tools</p>
    </footer>
  )
}
