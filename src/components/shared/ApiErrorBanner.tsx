import { AlertCircle } from 'lucide-react'
import type { ApiErrorDetail } from '@/lib/api'
import { parseApiError } from '@/lib/api'

interface ApiErrorBannerProps {
  error: unknown
  fallback: string
  className?: string
}

export function ApiErrorBanner({ error, fallback, className = '' }: ApiErrorBannerProps) {
  if (!error) return null

  const parsed: ApiErrorDetail =
    typeof error === 'string' ? { message: error } : parseApiError(error, fallback)

  const detailLines = parsed.details
    ? Object.entries(parsed.details).flatMap(([field, msgs]) =>
        msgs.map(m => (field === 'server' ? m : `${field}: ${m}`)),
      )
    : []

  return (
    <div
      role="alert"
      className={`rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left ${className}`}
    >
      <div className="flex gap-2">
        <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-red-800">{parsed.message}</p>
          {parsed.status != null && (
            <p className="text-xs text-red-600/80 mt-0.5">HTTP {parsed.status}</p>
          )}
          {detailLines.length > 1 && (
            <ul className="mt-2 space-y-1 text-xs text-red-700 list-disc list-inside">
              {detailLines.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
