import type { LensConfig } from '@/lib/types'
import type { FovSimulatorState, Orientation } from './types'
import { DEFAULT_FOV_STATE, MAX_LENSES, NEW_LENS_DEFAULTS } from '@/lib/data/fovSimulator'

export type Action =
  | { type: 'SET_LENS'; payload: { index: number; updates: Partial<LensConfig> } }
  | { type: 'ADD_LENS' }
  | { type: 'REMOVE_LENS'; payload: number }
  | { type: 'SET_IMAGE'; payload: number }
  | { type: 'SET_ACTIVE_LENS'; payload: number }
  | { type: 'SET_ORIENTATION'; payload: Orientation }
  | { type: 'SET_DISTANCE'; payload: number }
  | { type: 'SET_SHOW_GUIDES'; payload: boolean }
  | { type: 'RESET' }
  | { type: 'HYDRATE'; payload: Partial<FovSimulatorState> }

export function fovReducer(state: FovSimulatorState, action: Action): FovSimulatorState {
  switch (action.type) {
    case 'SET_LENS': {
      const { index, updates } = action.payload
      const lenses = state.lenses.map((l, i) => i === index ? { ...l, ...updates } : l)
      return { ...state, lenses }
    }
    case 'ADD_LENS': {
      if (state.lenses.length >= MAX_LENSES) return state
      const newLens = NEW_LENS_DEFAULTS[state.lenses.length - 1] ?? { focalLength: 135, sensorId: 'ff' }
      return { ...state, lenses: [...state.lenses, newLens], activeLens: state.lenses.length }
    }
    case 'REMOVE_LENS': {
      if (state.lenses.length <= 1) return state
      const lenses = state.lenses.filter((_, i) => i !== action.payload)
      const activeLens = state.activeLens >= lenses.length ? lenses.length - 1 : state.activeLens
      return { ...state, lenses, activeLens }
    }
    case 'SET_IMAGE':
      return { ...state, imageIndex: action.payload }
    case 'SET_ACTIVE_LENS':
      return { ...state, activeLens: action.payload }
    case 'SET_ORIENTATION':
      return { ...state, orientation: action.payload }
    case 'SET_DISTANCE':
      return { ...state, distance: action.payload }
    case 'SET_SHOW_GUIDES':
      return { ...state, showGuides: action.payload }
    case 'RESET':
      return { ...DEFAULT_FOV_STATE }
    case 'HYDRATE':
      return { ...state, ...action.payload }
    default:
      return state
  }
}
