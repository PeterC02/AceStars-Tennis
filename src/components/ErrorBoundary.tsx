'use client'

import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  retryCount: number
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, retryCount: 0 }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  handleRetry = () => {
    this.setState(prev => ({ hasError: false, error: null, retryCount: prev.retryCount + 1 }))
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="min-h-[300px] flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}>
              <AlertCircle size={28} style={{ color: '#EF4444' }} />
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ color: '#1E2333' }}>Something went wrong</h3>
            <p className="text-sm mb-4" style={{ color: '#676D82' }}>
              {this.state.error?.message || 'An unexpected error occurred. Please try again.'}
            </p>
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.02]"
              style={{ backgroundColor: '#F87D4D' }}
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook-based wrapper for fetch with retry logic
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  maxRetries = 3,
  delayMs = 1000
): Promise<Response> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch(url, options)
      if (res.ok || res.status < 500) return res
      lastError = new Error(`HTTP ${res.status}`)
    } catch (err: any) {
      lastError = err
    }

    if (attempt < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)))
    }
  }

  throw lastError || new Error('Request failed after retries')
}
