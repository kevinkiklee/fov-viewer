import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useDynamicMeta } from './useDynamicMeta'
import type { LensConfig } from '../types'

describe('useDynamicMeta', () => {
  const originalTitle = document.title

  beforeEach(() => {
    document.title = 'FOV Viewer — Camera Field of View & Focal Length Comparison Tool'
    const desc = document.createElement('meta')
    desc.setAttribute('name', 'description')
    desc.setAttribute('content', 'original')
    document.head.appendChild(desc)

    const ogTitle = document.createElement('meta')
    ogTitle.setAttribute('property', 'og:title')
    ogTitle.setAttribute('content', 'original')
    document.head.appendChild(ogTitle)
  })

  afterEach(() => {
    document.title = originalTitle
    document.querySelectorAll('meta[name="description"], meta[property="og:title"], meta[property="og:description"], meta[property="og:url"]').forEach((el) => el.remove())
  })

  it('updates title when URL has query params', () => {
    Object.defineProperty(window, 'location', {
      value: { ...window.location, search: '?a=50&sa=ff&b=85&sb=ff', href: 'http://localhost/?a=50&sa=ff&b=85&sb=ff' },
      writable: true,
    })

    const lenses: LensConfig[] = [
      { focalLength: 50, sensorId: 'ff' },
      { focalLength: 85, sensorId: 'ff' },
    ]
    renderHook(() => useDynamicMeta(lenses))
    expect(document.title).toBe('50mm vs 85mm (Full Frame) — FOV Viewer')
  })

  it('does not update title without query params', () => {
    Object.defineProperty(window, 'location', {
      value: { ...window.location, search: '', href: 'http://localhost/' },
      writable: true,
    })

    const lenses: LensConfig[] = [{ focalLength: 50, sensorId: 'ff' }]
    renderHook(() => useDynamicMeta(lenses))
    expect(document.title).toBe('FOV Viewer — Camera Field of View & Focal Length Comparison Tool')
  })
})
