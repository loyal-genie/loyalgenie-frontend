import { Component, type ErrorInfo, type ReactNode } from 'react'
import { isChunkLoadFailure, recoverFromChunkLoadFailure } from '@/lib/chunk-load-recovery'

interface Props {
  children: ReactNode
  variant?: 'customer' | 'vendor'
}

interface State {
  error: Error | null
}

export class RouteErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[RouteErrorBoundary]', error, info.componentStack)
    if (isChunkLoadFailure(error)) {
      recoverFromChunkLoadFailure()
    }
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    const chunk = isChunkLoadFailure(error)
    const isCustomer = this.props.variant === 'customer'

    return (
      <div
        className={`min-h-dvh flex flex-col items-center justify-center px-6 text-center ${
          isCustomer ? 'bg-white' : 'bg-v-surface'
        }`}
      >
        <p className="text-4xl mb-4" aria-hidden>
          {chunk ? '🔄' : '⚠️'}
        </p>
        <h1 className={`text-lg font-bold mb-2 ${isCustomer ? 'text-[#2b2827]' : 'text-v-text'}`}>
          {chunk ? 'Update available' : 'Something went wrong'}
        </h1>
        <p className={`text-sm mb-6 max-w-sm ${isCustomer ? 'text-[#6b6461]' : 'text-v-text-2'}`}>
          {chunk
            ? 'A new version was deployed. Refresh the page to continue.'
            : error.message || 'An unexpected error occurred.'}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className={`px-6 py-3 rounded-full font-bold text-sm text-white border-0 cursor-pointer ${
            isCustomer ? 'bg-[#5b0e81]' : 'bg-v-purple'
          }`}
        >
          Refresh page
        </button>
      </div>
    )
  }
}
