'use client'

import { useState } from 'react'
import type { Tooltip } from '@/lib/data/education/types'
import styles from './InfoTooltip.module.css'

interface InfoTooltipProps {
  tooltip: Tooltip
}

export function InfoTooltip({ tooltip }: InfoTooltipProps) {
  const [show, setShow] = useState(false)

  return (
    <span className={styles.wrapper}>
      <button
        className={styles.trigger}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        aria-label={`Info: ${tooltip.term}`}
        type="button"
      >
        &#9432;
      </button>
      {show && (
        <div className={styles.popover} role="tooltip">
          <div className={styles.term}>{tooltip.term}</div>
          <div className={styles.definition}>{tooltip.definition}</div>
        </div>
      )}
    </span>
  )
}
