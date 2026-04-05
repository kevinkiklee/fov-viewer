'use client'

import { useTranslations } from 'next-intl'

interface ThemeToggleProps {
  theme: string
  onChange: (theme: 'dark' | 'light') => void
}

export function ThemeToggle({ theme, onChange }: ThemeToggleProps) {
  const t = useTranslations('common.theme')
  const label = theme === 'dark' ? t('switchToLight') : t('switchToDark')

  return (
    <button
      onClick={() => onChange(theme === 'dark' ? 'light' : 'dark')}
      title={label}
      aria-label={label}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: 'var(--text-md)',
        color: 'var(--text-secondary)',
        padding: '8px',
        minWidth: '36px',
        minHeight: '36px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-sm)',
        transition: 'background var(--duration-fast)',
      }}
    >
      {theme === 'dark' ? '\u2600\uFE0F' : '\uD83C\uDF19'}
    </button>
  )
}
