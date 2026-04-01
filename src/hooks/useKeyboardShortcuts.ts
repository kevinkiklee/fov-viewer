import { useEffect } from 'react'
import type { AppState } from '../types'
import { FOCAL_LENGTHS } from '../data/focalLengths'

type Dispatch = (action: any) => void

export function useKeyboardShortcuts(state: AppState, dispatch: Dispatch): void {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return

      switch (e.key) {
        case 'Tab': {
          e.preventDefault()
          dispatch({ type: 'SET_ACTIVE_LENS', payload: state.activeLens === 'a' ? 'b' : 'a' })
          break
        }
        case '[': {
          e.preventDefault()
          nudgeFocalLength(state, dispatch, -1)
          break
        }
        case ']': {
          e.preventDefault()
          nudgeFocalLength(state, dispatch, 1)
          break
        }
        case 's':
        case 'S': {
          if (e.ctrlKey || e.metaKey) return
          e.preventDefault()
          dispatch({ type: 'SET_MODE', payload: state.mode === 'overlay' ? 'side' : 'overlay' })
          break
        }
        case 't':
        case 'T': {
          if (e.ctrlKey || e.metaKey) return
          e.preventDefault()
          dispatch({ type: 'SET_THEME', payload: state.theme === 'dark' ? 'light' : 'dark' })
          break
        }
        case '?': {
          e.preventDefault()
          dispatch({ type: 'TOGGLE_SHORTCUTS' })
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [state, dispatch])
}

function nudgeFocalLength(state: AppState, dispatch: Dispatch, direction: -1 | 1): void {
  const lens = state.activeLens === 'a' ? state.lensA : state.lensB
  const actionType = state.activeLens === 'a' ? 'SET_LENS_A' : 'SET_LENS_B'

  const presetValues = FOCAL_LENGTHS.map((fl) => fl.value)
  const currentIndex = presetValues.findIndex((v) => v >= lens.focalLength)

  let newIndex: number
  if (direction === -1) {
    newIndex = currentIndex <= 0 ? 0 : currentIndex - 1
  } else {
    newIndex = currentIndex >= presetValues.length - 1 ? presetValues.length - 1 : currentIndex + 1
  }

  dispatch({ type: actionType, payload: { focalLength: presetValues[newIndex] } })
}
