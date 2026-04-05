import { describe, it, expect } from 'vitest'
import { EXPOSURE_PROGRAMS, METERING_MODES, FLASH_MODES, WHITE_BALANCE, COLOR_SPACES } from './exifViewer'

describe('EXPOSURE_PROGRAMS', () => {
  it('contains 9 entries', () => {
    expect(Object.keys(EXPOSURE_PROGRAMS)).toHaveLength(9)
  })

  it('all values are non-empty strings', () => {
    for (const v of Object.values(EXPOSURE_PROGRAMS)) {
      expect(v).toBeTruthy()
      expect(typeof v).toBe('string')
    }
  })

  it('keys are sequential from 0 to 8', () => {
    for (let i = 0; i <= 8; i++) {
      expect(EXPOSURE_PROGRAMS[String(i)]).toBeDefined()
    }
  })
})

describe('METERING_MODES', () => {
  it('contains 7 entries', () => {
    expect(Object.keys(METERING_MODES)).toHaveLength(7)
  })

  it('all values are non-empty strings', () => {
    for (const v of Object.values(METERING_MODES)) {
      expect(v).toBeTruthy()
    }
  })
})

describe('FLASH_MODES', () => {
  it('contains 11 entries', () => {
    expect(Object.keys(FLASH_MODES)).toHaveLength(11)
  })

  it('all values are non-empty strings', () => {
    for (const v of Object.values(FLASH_MODES)) {
      expect(v).toBeTruthy()
    }
  })

  it('includes no-flash and flash-fired states', () => {
    expect(FLASH_MODES[0x00]).toBe('No flash')
    expect(FLASH_MODES[0x01]).toBe('Flash fired')
  })
})

describe('WHITE_BALANCE', () => {
  it('has Auto and Manual entries', () => {
    expect(WHITE_BALANCE['0']).toBe('Auto')
    expect(WHITE_BALANCE['1']).toBe('Manual')
  })
})

describe('COLOR_SPACES', () => {
  it('includes sRGB, Adobe RGB, and Uncalibrated', () => {
    expect(COLOR_SPACES['1']).toBe('sRGB')
    expect(COLOR_SPACES['2']).toBe('Adobe RGB')
    expect(COLOR_SPACES['65535']).toBe('Uncalibrated')
  })
})
