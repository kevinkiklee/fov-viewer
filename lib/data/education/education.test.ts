import { describe, it, expect } from 'vitest'
import { getEducationBySlug } from './index'
import { TOOLS } from '../tools'

describe('Education content', () => {
  it('every tool with education has valid structure', () => {
    for (const tool of TOOLS) {
      const edu = getEducationBySlug(tool.slug)
      if (!edu) continue
      expect(edu.slug).toBe(tool.slug)
      expect(edu.beginner).toBeTruthy()
      expect(edu.deeper).toBeTruthy()
      expect(Array.isArray(edu.tips)).toBe(true)
      expect(edu.tips.length).toBeGreaterThan(0)
      expect(typeof edu.tooltips).toBe('object')
    }
  })

  it('challenges have required fields', () => {
    for (const tool of TOOLS) {
      const edu = getEducationBySlug(tool.slug)
      if (!edu || !edu.challenges) continue
      for (const c of edu.challenges) {
        expect(c.id).toBeTruthy()
        expect(['beginner', 'intermediate', 'advanced']).toContain(c.difficulty)
        expect(c.scenario).toBeTruthy()
        expect(c.successMessage).toBeTruthy()
        expect(c.failureMessage).toBeTruthy()
      }
    }
  })

  it('tips have text', () => {
    for (const tool of TOOLS) {
      const edu = getEducationBySlug(tool.slug)
      if (!edu) continue
      for (const tip of edu.tips) {
        expect(tip.text).toBeTruthy()
      }
    }
  })

  it('returns undefined for unknown slug', () => {
    expect(getEducationBySlug('nonexistent-tool')).toBeUndefined()
  })
})
