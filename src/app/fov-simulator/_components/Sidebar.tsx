'use client'

import type { ReactNode } from 'react'
import styles from './FovSimulator.module.css'

interface SidebarProps {
  children: ReactNode
}

export function Sidebar({ children }: SidebarProps) {
  return <aside className={styles.sidebar}>{children}</aside>
}
