import { openDB, IDBPDatabase } from 'idb'

type CacheItem<T> = {
  value: T
  expiry: number
}

const DB_NAME = 'brainzrr-cache'
const STORE_NAME = 'cache'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase> | null = null

const getDB = () => {
  if (typeof window === 'undefined') return null
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME)
        }
      },
    })
  }
  return dbPromise
}

export const cacheService = {
  set: async <T>(key: string, value: T, ttlInMs: number = 1000 * 60 * 60 * 24) => { // Default 24h
    const db = await getDB()
    if (!db) return

    const item: CacheItem<T> = {
      value,
      expiry: Date.now() + ttlInMs,
    }
    await db.put(STORE_NAME, item, key)
  },

  get: async <T>(key: string): Promise<T | null> => {
    const db = await getDB()
    if (!db) return null

    try {
      const item: CacheItem<T> | undefined = await db.get(STORE_NAME, key)
      
      if (!item) return null

      if (typeof item === 'object' && 'value' in item && 'expiry' in item) {
        if (Date.now() > item.expiry) {
          await db.delete(STORE_NAME, key)
          return null
        }
        return item.value as T
      }
      
      // Invalid format
      await db.delete(STORE_NAME, key)
      return null
    } catch (e) {
      console.error(`Error getting cache item for key: ${key}`, e)
      return null
    }
  },

  remove: async (key: string) => {
    const db = await getDB()
    if (!db) return
    await db.delete(STORE_NAME, key)
  },

  clear: async () => {
    const db = await getDB()
    if (!db) return
    await db.clear(STORE_NAME)
  },

  getAllKeys: async (): Promise<string[]> => {
    const db = await getDB()
    if (!db) return []
    return db.getAllKeys(STORE_NAME) as Promise<string[]>
  },

  getSize: async (): Promise<number> => {
    const db = await getDB()
    if (!db) return 0
    const all = await db.getAll(STORE_NAME)
    const jsonString = JSON.stringify(all)
    return jsonString.length * 2 // Rough estimate in bytes
  }
}
