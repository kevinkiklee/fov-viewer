import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Photo Tools — Free Photography Calculators & References',
    template: '%s | Photo Tools',
  },
  description: 'Free browser-based photography tools.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
