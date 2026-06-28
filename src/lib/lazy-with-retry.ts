import { lazy, type ComponentType } from 'react'
import { isChunkLoadFailure, recoverFromChunkLoadFailure } from './chunk-load-recovery'

type ModuleDefault<T> = { default: T }

const PENDING_RELOAD = new Promise<never>(() => {})

/**
 * Lazy-load with automatic full-page reload when a stale chunk hash is requested
 * (common after Vercel deploy while a tab still has the previous bundle).
 */
export function lazyWithRetry<T extends ComponentType<unknown>>(
  factory: () => Promise<ModuleDefault<T>>,
) {
  return lazy(async () => {
    try {
      return await factory()
    } catch (error) {
      if (isChunkLoadFailure(error) && recoverFromChunkLoadFailure()) {
        return PENDING_RELOAD
      }
      throw error
    }
  })
}
