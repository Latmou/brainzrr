'use client'

type CacheItem<T> = {
  value: T
  expiry: number
}

export const cacheService = {
  set: <T>(key: string, value: T, ttlInMs: number = 1000 * 60 * 60 * 24) => { // Default 24h
    if (typeof window === 'undefined') return

    const item: CacheItem<T> = {
      value,
      expiry: Date.now() + ttlInMs,
    }
    localStorage.setItem(key, JSON.stringify(item))
  },

  get: <T>(key: string): T | null => {
    if (typeof window === 'undefined') return null

    const itemStr = localStorage.getItem(key)
    if (!itemStr) return null

    // Basic check for JSON-like structure
    if (!itemStr.startsWith('{') && !itemStr.startsWith('[')) {
      console.warn(`Cache item for key "${key}" is not valid JSON, removing.`)
      localStorage.removeItem(key)
      return null
    }

    try {
      const item = JSON.parse(itemStr)
      
      // Check if it's our CacheItem format
      if (item && typeof item === 'object' && 'value' in item && 'expiry' in item) {
        if (Date.now() > item.expiry) {
          localStorage.removeItem(key)
          return null
        }
        return item.value as T
      }
      
      // If it's not our format, it might be legacy data or something else
      // We'll treat it as invalid for our cache service and remove it
      localStorage.removeItem(key)
      return null
    } catch (e) {
      console.error(`Error parsing cache item for key: ${key}`, e)
      localStorage.removeItem(key)
      return null
    }
  },

  remove: (key: string) => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(key)
  },

  clear: () => {
    if (typeof window === 'undefined') return
    localStorage.clear()
  }
}
