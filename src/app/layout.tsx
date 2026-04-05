import type { ReactNode } from 'react'
import './globals.css'

type Props = {
  children: ReactNode
}

// Root layout — imports global styles.
// [locale]/layout.tsx renders <html> and <body> with locale-specific attributes.
export default function RootLayout({ children }: Props) {
  return children
}
