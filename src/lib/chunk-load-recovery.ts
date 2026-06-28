const RELOAD_ONCE_KEY = 'lg:chunk-reload'

const CHUNK_ERROR_RE =
  /Loading chunk|Failed to fetch dynamically imported module|Importing a module script failed|MIME type|text\/html/i

export function isChunkLoadFailure(error: unknown): boolean {
  if (error instanceof Error) {
    return CHUNK_ERROR_RE.test(error.message)
  }
  if (typeof error === 'string') {
    return CHUNK_ERROR_RE.test(error)
  }
  return false
}

/** Reload once per session so users pick up fresh index.html + chunk hashes after deploy. */
export function recoverFromChunkLoadFailure(): boolean {
  if (typeof window === 'undefined') return false
  try {
    if (sessionStorage.getItem(RELOAD_ONCE_KEY)) return false
    sessionStorage.setItem(RELOAD_ONCE_KEY, '1')
    window.location.reload()
    return true
  } catch {
    return false
  }
}

export function clearChunkReloadFlag(): void {
  try {
    sessionStorage.removeItem(RELOAD_ONCE_KEY)
  } catch {
    // ignore private browsing / storage errors
  }
}

export function installChunkLoadRecovery(): void {
  window.addEventListener('unhandledrejection', event => {
    if (!isChunkLoadFailure(event.reason)) return
    event.preventDefault()
    recoverFromChunkLoadFailure()
  })

  window.addEventListener(
    'error',
    event => {
      const target = event.target
      if (!(target instanceof HTMLScriptElement) || target.tagName !== 'SCRIPT') return
      if (!target.src.includes('/assets/')) return
      event.preventDefault()
      recoverFromChunkLoadFailure()
    },
    true,
  )
}
