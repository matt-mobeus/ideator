import type { ExecutionPlan } from './types'

/**
 * IndexedDB persistence layer for pipeline execution plans.
 * Uses raw IndexedDB API with dedicated database to avoid Dexie schema changes.
 */
export class PipelineStore {
  private dbName = 'ideator-pipeline'
  private storeName = 'executions'
  private version = 1
  private cachedDb: IDBDatabase | null = null

  /**
   * Opens the IndexedDB database, creating the object store if needed.
   */
  private async getDb(): Promise<IDBDatabase> {
    if (this.cachedDb) return this.cachedDb

    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.dbName, this.version)

      req.onupgradeneeded = () => {
        const db = req.result
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' })
        }
      }

      req.onsuccess = () => {
        this.cachedDb = req.result
        this.cachedDb.onclose = () => { this.cachedDb = null }
        resolve(this.cachedDb)
      }
      req.onerror = () => reject(req.error)
    })
  }

  /** Closes the cached database connection. */
  closeDb(): void {
    if (this.cachedDb) {
      this.cachedDb.close()
      this.cachedDb = null
    }
  }

  /**
   * Saves an execution plan to IndexedDB.
   * Creates a new record or updates an existing one.
   */
  async save(plan: ExecutionPlan): Promise<void> {
    const db = await this.getDb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite')
      // Strip Blob references before persisting — they aren't serializable across all environments
      const serializable = structuredClone(plan)
      for (const task of Object.values(serializable.tasks)) {
        if (task.input && typeof task.input === 'object') {
          const inp = task.input as Record<string, unknown>
          if (inp.files && Array.isArray(inp.files)) {
            inp.files = (inp.files as Array<Record<string, unknown>>).map(f => ({
              ...f,
              blob: undefined,
            }))
          }
        }
      }
      tx.objectStore(this.storeName).put(serializable)
      tx.oncomplete = () => {
        resolve()
      }
      tx.onerror = () => {
        reject(tx.error)
      }
    })
  }

  /**
   * Loads an execution plan by ID.
   * Returns null if not found.
   */
  async load(id: string): Promise<ExecutionPlan | null> {
    const db = await this.getDb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readonly')
      const req = tx.objectStore(this.storeName).get(id)
      req.onsuccess = () => {
        resolve(req.result ?? null)
      }
      req.onerror = () => {
        reject(req.error)
      }
    })
  }

  /**
   * Returns all execution plans that can be resumed (running or paused).
   */
  async getResumable(): Promise<ExecutionPlan[]> {
    const db = await this.getDb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readonly')
      const req = tx.objectStore(this.storeName).getAll()
      req.onsuccess = () => {
        const plans = (req.result ?? []) as ExecutionPlan[]
        resolve(plans.filter(p => p.status === 'running' || p.status === 'paused'))
      }
      req.onerror = () => {
        reject(req.error)
      }
    })
  }

  /**
   * Deletes an execution plan by ID.
   */
  async delete(id: string): Promise<void> {
    const db = await this.getDb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite')
      tx.objectStore(this.storeName).delete(id)
      tx.oncomplete = () => {
        resolve()
      }
      tx.onerror = () => {
        reject(tx.error)
      }
    })
  }

  /**
   * Returns all stored execution plans.
   */
  async getAll(): Promise<ExecutionPlan[]> {
    const db = await this.getDb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readonly')
      const req = tx.objectStore(this.storeName).getAll()
      req.onsuccess = () => {
        resolve((req.result ?? []) as ExecutionPlan[])
      }
      req.onerror = () => {
        reject(req.error)
      }
    })
  }

  /**
   * Clears all stored execution plans.
   */
  async clear(): Promise<void> {
    const db = await this.getDb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite')
      tx.objectStore(this.storeName).clear()
      tx.oncomplete = () => {
        resolve()
      }
      tx.onerror = () => {
        reject(tx.error)
      }
    })
  }
}

// Singleton instance
export const pipelineStore = new PipelineStore()
