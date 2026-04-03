import { describe, it, expect } from 'vitest'
import { TOOLS, getToolBySlug, getLiveTools } from './tools'

describe('TOOLS registry', () => {
  it('contains at least one tool', () => {
    expect(TOOLS.length).toBeGreaterThan(0)
  })

  it('all tools have required fields', () => {
    for (const tool of TOOLS) {
      expect(tool.slug).toBeTruthy()
      expect(tool.name).toBeTruthy()
      expect(tool.description).toBeTruthy()
      expect(['live', 'draft']).toContain(tool.status)
      expect(['calculator', 'visualizer', 'reference', 'file-tool']).toContain(tool.category)
    }
  })

  it('slugs are unique', () => {
    const slugs = TOOLS.map((t) => t.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('getToolBySlug returns correct tool', () => {
    const tool = getToolBySlug('fov-viewer')
    expect(tool?.name).toBe('FOV Viewer')
  })

  it('getToolBySlug returns undefined for unknown slug', () => {
    expect(getToolBySlug('nonexistent')).toBeUndefined()
  })

  it('getLiveTools filters to live only', () => {
    const live = getLiveTools()
    for (const tool of live) {
      expect(tool.status).toBe('live')
    }
  })
})
