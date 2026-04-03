'use client'

import { useState, useEffect, createContext, useContext, type ReactNode } from 'react'
import { Nav } from './Nav'
import { Footer } from './Footer'

interface ThemeContextValue {
  theme: 'dark' | 'light'
  setTheme: (t: 'dark' | 'light') => void
}

const ThemeContext = createContext<ThemeContextValue>({ theme: 'dark', setTheme: () => {} })
export function useTheme() { return useContext(ThemeContext) }

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const saved = localStorage.getItem('phototools-theme') as 'dark' | 'light' | null
    if (saved) setTheme(saved)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('phototools-theme', theme)
  }, [theme])

  return (
    <ThemeContext value={{ theme, setTheme }}>
      <Nav theme={theme} onThemeChange={setTheme} />
      <main style={{ flex: 1, minHeight: 0, overflow: 'auto', width: '80%', maxWidth: 1400, margin: '0 auto', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>{children}</main>
      <Footer />
    </ThemeContext>
  )
}
