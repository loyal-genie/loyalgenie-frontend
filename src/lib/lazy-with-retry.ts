import { lazy, type ComponentType } from 'react'

type ModuleDefault<T> = { default: T }

/**
 * Retry dynamic import once — handles stale chunk hashes after a Vercel deploy.
 */
export function lazyWithRetry<T extends ComponentType<unknown>>(
  factory: () => Promise<ModuleDefault<T>>,
) {
  return lazy(async () => {
    try {
      return await factory()
    } catch (first) {
      await new Promise(resolve => setTimeout(resolve, 800))
      return factory()
    }
  })
}
