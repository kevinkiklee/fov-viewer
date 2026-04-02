import { describe, it, expect } from 'vitest'

import type { AppState, LensConfig, Orientation } from './types'
import { DEFAULT_STATE, MAX_LENSES } from './types'

type Action =
  | { type: 'SET_LENS'; payload: { index: number; updates: Partial<LensConfig> } }
  | { type: 'ADD_LENS' }
  | { type: 'REMOVE_LENS'; payload: number }
  | { type: 'SET_IMAGE'; payload: number }
  | { type: 'SET_THEME'; payload: 'dark' | 'light' }
  | { type: 'SET_ACTIVE_LENS'; payload: number }
  | { type: 'SET_ORIENTATION'; payload: Orientation }
  | { type: 'RESET' }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_LENS': {
      const { index, updates } = action.payload
      const lenses = state.lenses.map((l, i) => i === index ? { ...l, ...updates } : l)
      return { ...state, lenses }
    }
    case 'ADD_LENS': {
      if (state.lenses.length >= MAX_LENSES) return state
      return { ...state, lenses: [...state.lenses, { focalLength: 85, sensorId: 'ff' }], activeLens: state.lenses.length }
    }
    case 'REMOVE_LENS': {
      if (state.lenses.length <= 1) return state
      const lenses = state.lenses.filter((_, i) => i !== action.payload)
      const activeLens = state.activeLens >= lenses.length ? lenses.length - 1 : state.activeLens
      return { ...state, lenses, activeLens }
    }
    case 'SET_IMAGE':
      return { ...state, imageIndex: action.payload }
    case 'SET_THEME':
      return { ...state, theme: action.payload }
    case 'SET_ACTIVE_LENS':
      return { ...state, activeLens: action.payload }
    case 'SET_ORIENTATION':
      return { ...state, orientation: action.payload }
    case 'RESET':
      return { ...DEFAULT_STATE, theme: state.theme }
    default:
      return state
  }
}

describe('App reducer', () => {
  it('SET_LENS updates focal length for lens at index', () => {
    const state = reducer(DEFAULT_STATE, { type: 'SET_LENS', payload: { index: 0, updates: { focalLength: 100 } } })
    expect(state.lenses[0].focalLength).toBe(100)
    expect(state.lenses[0].sensorId).toBe('ff') // preserves other fields
  })

  it('SET_LENS updates sensor only', () => {
    const state = reducer(DEFAULT_STATE, { type: 'SET_LENS', payload: { index: 0, updates: { sensorId: 'apsc_n' } } })
    expect(state.lenses[0].sensorId).toBe('apsc_n')
    expect(state.lenses[0].focalLength).toBe(DEFAULT_STATE.lenses[0].focalLength)
  })

  it('SET_LENS updates second lens', () => {
    const state = reducer(DEFAULT_STATE, { type: 'SET_LENS', payload: { index: 1, updates: { focalLength: 200 } } })
    expect(state.lenses[1].focalLength).toBe(200)
    expect(state.lenses[0].focalLength).toBe(DEFAULT_STATE.lenses[0].focalLength) // first lens unchanged
  })

  it('ADD_LENS adds a lens and sets it active', () => {
    const state = reducer(DEFAULT_STATE, { type: 'ADD_LENS' })
    expect(state.lenses.length).toBe(DEFAULT_STATE.lenses.length + 1)
    expect(state.activeLens).toBe(DEFAULT_STATE.lenses.length)
  })

  it('ADD_LENS does not exceed MAX_LENSES', () => {
    let state = DEFAULT_STATE
    for (let i = 0; i < 10; i++) {
      state = reducer(state, { type: 'ADD_LENS' })
    }
    expect(state.lenses.length).toBe(MAX_LENSES)
  })

  it('REMOVE_LENS removes a lens', () => {
    const state = reducer(DEFAULT_STATE, { type: 'REMOVE_LENS', payload: 0 })
    expect(state.lenses.length).toBe(DEFAULT_STATE.lenses.length - 1)
  })

  it('REMOVE_LENS does not go below 1', () => {
    let state = { ...DEFAULT_STATE, lenses: [DEFAULT_STATE.lenses[0]] }
    state = reducer(state, { type: 'REMOVE_LENS', payload: 0 })
    expect(state.lenses.length).toBe(1)
  })

  it('REMOVE_LENS adjusts activeLens if needed', () => {
    const state = { ...DEFAULT_STATE, activeLens: 1 }
    const result = reducer(state, { type: 'REMOVE_LENS', payload: 1 })
    expect(result.activeLens).toBeLessThan(result.lenses.length)
  })

  it('SET_IMAGE updates image index', () => {
    const state = reducer(DEFAULT_STATE, { type: 'SET_IMAGE', payload: 3 })
    expect(state.imageIndex).toBe(3)
  })

  it('SET_THEME toggles theme', () => {
    const state = reducer(DEFAULT_STATE, { type: 'SET_THEME', payload: 'light' })
    expect(state.theme).toBe('light')
  })

  it('SET_ACTIVE_LENS switches active lens', () => {
    const state = reducer(DEFAULT_STATE, { type: 'SET_ACTIVE_LENS', payload: 1 })
    expect(state.activeLens).toBe(1)
  })

  it('SET_ORIENTATION changes orientation', () => {
    const state = reducer(DEFAULT_STATE, { type: 'SET_ORIENTATION', payload: 'portrait' })
    expect(state.orientation).toBe('portrait')
  })

  it('RESET restores defaults but preserves theme', () => {
    const modified: AppState = {
      ...DEFAULT_STATE,
      lenses: [{ focalLength: 200, sensorId: 'apsc_n' }],
      imageIndex: 4,
      theme: 'light',
      activeLens: 0,
    }
    const state = reducer(modified, { type: 'RESET' })
    expect(state.lenses).toEqual(DEFAULT_STATE.lenses)
    expect(state.imageIndex).toBe(DEFAULT_STATE.imageIndex)
    expect(state.theme).toBe('light') // preserved
    expect(state.activeLens).toBe(DEFAULT_STATE.activeLens)
  })

  it('does not mutate previous state', () => {
    const before = { ...DEFAULT_STATE, lenses: [...DEFAULT_STATE.lenses] }
    const beforeLens0 = { ...before.lenses[0] }
    reducer(before, { type: 'SET_LENS', payload: { index: 0, updates: { focalLength: 200 } } })
    expect(before.lenses[0]).toEqual(beforeLens0)
  })

  it('unknown action returns state unchanged', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const state = reducer(DEFAULT_STATE, { type: 'UNKNOWN' } as any)
    expect(state).toBe(DEFAULT_STATE)
  })

  it('sequential actions compose correctly', () => {
    let state = DEFAULT_STATE
    state = reducer(state, { type: 'SET_LENS', payload: { index: 0, updates: { focalLength: 24 } } })
    state = reducer(state, { type: 'SET_LENS', payload: { index: 1, updates: { focalLength: 200, sensorId: 'apsc_n' } } })
    state = reducer(state, { type: 'SET_ACTIVE_LENS', payload: 1 })

    expect(state.lenses[0].focalLength).toBe(24)
    expect(state.lenses[1].focalLength).toBe(200)
    expect(state.lenses[1].sensorId).toBe('apsc_n')
    expect(state.activeLens).toBe(1)
  })
})
