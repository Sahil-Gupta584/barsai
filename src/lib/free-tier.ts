const FREE_TIER_KEY = 'rippy_free_used'

/**
 * Client-side only. Checks if the guest user has used their free generation.
 * Authenticated users always get access.
 */
export function checkFreeTier(isAuthenticated: boolean): {
  allowed: boolean
  requiresAuth: boolean
} {
  if (isAuthenticated) {
    return { allowed: true, requiresAuth: false }
  }

  if (typeof window === 'undefined') {
    // SSR — allow, actual enforcement is server-side
    return { allowed: true, requiresAuth: false }
  }

  const used = localStorage.getItem(FREE_TIER_KEY)
  if (used === 'true') {
    return { allowed: false, requiresAuth: true }
  }

  return { allowed: true, requiresAuth: false }
}

/**
 * Mark the free tier as used. Call after a successful guest generation.
 */
export function markFreeTierUsed(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(FREE_TIER_KEY, 'true')
  }
}

/**
 * Reset free tier (for testing / after sign-in).
 */
export function resetFreeTier(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(FREE_TIER_KEY)
  }
}
