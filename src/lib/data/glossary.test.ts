import { describe, it, expect } from 'vitest'
import { GLOSSARY } from './glossary'
import { TOOLS } from './tools'

describe('GLOSSARY', () => {
  it('has 50+ terms', () => {
    expect(GLOSSARY.length).toBeGreaterThanOrEqual(50)
  })
  it('ids are unique', () => {
    const ids = GLOSSARY.map(g => g.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('all entries have ids', () => {
    for (const g of GLOSSARY) {
      expect(g.id).toBeTruthy()
    }
  })
  it('relatedTool slugs match actual tools', () => {
    const toolSlugs = new Set(TOOLS.map(t => t.slug))
    for (const g of GLOSSARY) {
      if (g.relatedTool) {
        expect(toolSlugs.has(g.relatedTool)).toBe(true)
      }
    }
  })
  it('ids are sorted alphabetically', () => {
    for (let i = 1; i < GLOSSARY.length; i++) {
      expect(GLOSSARY[i].id.toLowerCase() >= GLOSSARY[i-1].id.toLowerCase()).toBe(true)
    }
  })
})
