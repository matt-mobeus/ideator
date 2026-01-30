import { db } from '@/db/database.ts'
import type { EntityTable } from 'dexie'

type StoreKey = 'files' | 'concepts' | 'clusters' | 'analyses' | 'visualizations' | 'assets' | 'provenance' | 'queue' | 'settings'

function getTable(store: StoreKey): EntityTable<Record<string, unknown>, 'id'> {
  return db[store] as unknown as EntityTable<Record<string, unknown>, 'id'>
}

export const storage = {
  async getAll<T>(store: StoreKey): Promise<T[]> {
    return getTable(store).toArray() as Promise<T[]>
  },

  async getById<T>(store: StoreKey, id: string): Promise<T | undefined> {
    return getTable(store).get(id) as Promise<T | undefined>
  },

  async put<T extends { id: string }>(store: StoreKey, item: T): Promise<string> {
    return getTable(store).put(item as unknown as Record<string, unknown>) as unknown as Promise<string>
  },

  async bulkPut<T extends { id: string }>(store: StoreKey, items: T[]): Promise<void> {
    await getTable(store).bulkPut(items as unknown as Record<string, unknown>[])
  },

  async delete(store: StoreKey, id: string): Promise<void> {
    await getTable(store).delete(id)
  },

  async clear(store: StoreKey): Promise<void> {
    await getTable(store).clear()
  },

  async count(store: StoreKey): Promise<number> {
    return getTable(store).count()
  },

  async where<T>(store: StoreKey, field: string, value: unknown): Promise<T[]> {
    return getTable(store).where(field).equals(value as string).toArray() as Promise<T[]>
  },
}
