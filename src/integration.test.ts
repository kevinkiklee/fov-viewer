import { describe, it, expect } from 'vitest'
import { calcFOV, calcFrameWidth, calcCropRatio, calcEquivFocalLength } from './utils/fov'
import { getSensor, SENSORS } from './data/sensors'
import { FOCAL_LENGTHS } from './data/focalLengths'
import { DEFAULT_STATE } from './types'
import { stateToQueryString, parseQueryParams } from './hooks/useQuerySync'

describe('FOV calculation with real sensor data', () => {
  it('50mm on each sensor produces progressively narrower FOV', () => {
    const fovs = SENSORS.map((s) => ({
      sensor: s.id,
      fov: calcFOV(50, s.cropFactor).horizontal,
    }))
    // SENSORS is sorted by ascending crop factor, so FOV should decrease
    for (let i = 1; i < fovs.length; i++) {
      expect(fovs[i].fov).toBeLessThan(fovs[i - 1].fov)
    }
  })

  it('all preset focal lengths produce valid FOV on full frame', () => {
    for (const fl of FOCAL_LENGTHS) {
      const fov = calcFOV(fl.value, 1.0)
      expect(fov.horizontal).toBeGreaterThan(0)
      expect(fov.horizontal).toBeLessThan(180)
      expect(fov.vertical).toBeGreaterThan(0)
      expect(fov.vertical).toBeLessThan(fov.horizontal)
    }
  })

  it('all preset focal lengths produce valid FOV on all sensors', () => {
    for (const fl of FOCAL_LENGTHS) {
      for (const sensor of SENSORS) {
        const fov = calcFOV(fl.value, sensor.cropFactor)
        expect(fov.horizontal).toBeGreaterThan(0)
        expect(fov.horizontal).toBeLessThan(180)
      }
    }
  })

  it('frame width is reasonable for portrait distance', () => {
    // 85mm portrait at 3m distance
    const fov = calcFOV(85, 1.0)
    const width = calcFrameWidth(fov.horizontal, 3)
    expect(width).toBeGreaterThan(0.5)
    expect(width).toBeLessThan(3)
  })

  it('crop ratio between default lenses makes physical sense', () => {
    const lens0 = DEFAULT_STATE.lenses[0]
    const lens1 = DEFAULT_STATE.lenses[1]
    const sensor0 = getSensor(lens0.sensorId)
    const sensor1 = getSensor(lens1.sensorId)
    const fov0 = calcFOV(lens0.focalLength, sensor0.cropFactor)
    const fov1 = calcFOV(lens1.focalLength, sensor1.cropFactor)
    const ratio = calcCropRatio(fov1.horizontal, fov0.horizontal)

    // Second lens has longer focal length = narrower FOV, so ratio < 1
    expect(ratio).toBeLessThan(1)
    expect(ratio).toBeGreaterThan(0)
  })

  it('equivalent focal length matches crop factor relationship', () => {
    const equiv = calcEquivFocalLength(50, 1.5)
    const fovApsC = calcFOV(50, 1.5)
    const fovEquiv = calcFOV(equiv, 1.0)
    expect(fovApsC.horizontal).toBeCloseTo(fovEquiv.horizontal, 0)
  })
})

describe('State serialization round-trip', () => {
  it('default state survives serialization', () => {
    const qs = stateToQueryString(DEFAULT_STATE)
    window.history.replaceState(null, '', `/?${qs}`)
    const parsed = parseQueryParams()

    expect(parsed.lenses).toBeDefined()
    expect(parsed.lenses!.length).toBe(DEFAULT_STATE.lenses.length)
    expect(parsed.lenses![0].focalLength).toBe(DEFAULT_STATE.lenses[0].focalLength)
    expect(parsed.lenses![1].focalLength).toBe(DEFAULT_STATE.lenses[1].focalLength)
    expect(parsed.theme).toBe(DEFAULT_STATE.theme)
  })

  it('extreme values survive serialization', () => {
    const state = {
      ...DEFAULT_STATE,
      lenses: [
        { focalLength: 8, sensorId: 'mf' },
        { focalLength: 800, sensorId: '1in' },
      ],
      imageIndex: 4,
      theme: 'light' as const,
    }
    const qs = stateToQueryString(state)
    window.history.replaceState(null, '', `/?${qs}`)
    const parsed = parseQueryParams()

    expect(parsed.lenses![0].focalLength).toBe(8)
    expect(parsed.lenses![0].sensorId).toBe('mf')
    expect(parsed.lenses![1].focalLength).toBe(800)
    expect(parsed.lenses![1].sensorId).toBe('1in')
    expect(parsed.imageIndex).toBe(4)
    expect(parsed.theme).toBe('light')
  })
})

describe('Sensor data integrity', () => {
  it('getSensor returns correct sensor for default state lenses', () => {
    for (const lens of DEFAULT_STATE.lenses) {
      const sensor = getSensor(lens.sensorId)
      expect(sensor.cropFactor).toBe(1.0)
    }
  })

  it('all focal length presets work with getSensor fallback', () => {
    const sensor = getSensor('nonexistent')
    for (const fl of FOCAL_LENGTHS) {
      const fov = calcFOV(fl.value, sensor.cropFactor)
      expect(fov.horizontal).toBeGreaterThan(0)
    }
  })
})
