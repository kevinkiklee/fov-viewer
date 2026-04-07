'use client'

import { Component, type ReactNode, type ErrorInfo } from 'react'
import { trackJsError } from '../index'

type Props = { children: ReactNode }
type State = { hasError: boolean }

export class AnalyticsErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    trackJsError({
      message: error.message,
      source: errorInfo.componentStack?.split('\n')[1]?.trim(),
    })
  }

  render() {
    if (this.state.hasError) {
      return this.props.children
    }
    return this.props.children
  }
}
