'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ss from './MegapixelVisualizer.module.css'

interface Props {
  onAdd: (name: string, mp: number) => void
}

export function CustomMegapixelForm({ onAdd }: Props) {
  const t = useTranslations('toolUI.megapixel-visualizer')
  const [name, setName] = useState('')
  const [mp, setMp] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleAdd = () => {
    setError(null)
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError(t('mpNameRequired'))
      return
    }
    const mpNum = parseFloat(mp)
    if (!mpNum || mpNum <= 0) {
      setError(t('mpMustBePositive'))
      return
    }
    if (mpNum > 1000) {
      setError(t('mpMaxExceeded'))
      return
    }
    onAdd(trimmedName, mpNum)
    setName('')
    setMp('')
  }

  return (
    <div className={ss.customForm} data-testid="custom-mp-form">
      <input
        type="text"
        placeholder={t('placeholderMpName')}
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={`${ss.customInput} ${ss.customFormName}`}
        data-testid="custom-mp-name"
      />
      <input
        type="number"
        placeholder={t('placeholderMpShort')}
        value={mp}
        onChange={(e) => setMp(e.target.value)}
        className={`${ss.customInput} ${ss.customFormMp}`}
        min={1}
        max={1000}
        step="0.1"
        data-testid="custom-mp-value"
      />
      <button
        type="button"
        onClick={handleAdd}
        className={`${ss.customAddBtn} ${ss.customFormAddBtn}`}
        aria-label={t('addMegapixel')}
        title={t('addMegapixel')}
        data-testid="custom-mp-add"
      >
        +
      </button>
      {error && <div className={`${ss.customWarning} ${ss.customFormError}`}>{error}</div>}
    </div>
  )
}
