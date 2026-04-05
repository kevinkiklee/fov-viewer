'use client'

import * as Tooltip from '@radix-ui/react-tooltip'
import { useTranslations } from 'next-intl'
import type { Tooltip as TooltipData } from '@/lib/data/education/types'
import styles from './InfoTooltip.module.css'

interface InfoTooltipProps {
  tooltip: TooltipData
}

export function InfoTooltip({ tooltip }: InfoTooltipProps) {
  const t = useTranslations('common.tooltip')

  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            className={styles.trigger}
            aria-label={t('infoLabel', { term: tooltip.term })}
            type="button"
          >
            &#9432;
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className={styles.popover} sideOffset={6} side="top">
            <div className={styles.term}>{tooltip.term}</div>
            <div className={styles.definition}>{tooltip.definition}</div>
            <Tooltip.Arrow className={styles.arrow} />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}
