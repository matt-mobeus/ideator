/**
 * Encryption utilities for securing API keys in IndexedDB.
 * Uses Web Crypto API (AES-GCM) with a non-exportable CryptoKey
 * stored in a dedicated IndexedDB object store.
 */

import { logger } from '@/utils/logger.ts'

const DB_NAME = 'ideator-encryption'
const STORE_NAME = 'encryption-keys'
const KEY_ID = 'master'

/** Encrypted payload stored in place of plaintext API keys. */
export interface EncryptedValue {
  /** Base64-encoded ciphertext */
  ct: string
  /** Base64-encoded initialization vector */
  iv: string
  /** Marker so we can distinguish encrypted from plaintext */
  __encrypted: true
}

// ---------------------------------------------------------------------------
// Internal: IndexedDB for the CryptoKey
// ---------------------------------------------------------------------------

function openKeyStore(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      const _db = req.result
      if (!_db.objectStoreNames.contains(STORE_NAME)) {
        _db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function getStoredKey(store: IDBObjectStore): Promise<CryptoKey | null> {
  return new Promise((resolve, reject) => {
    const req = store.get(KEY_ID)
    req.onsuccess = () => {
      const record = req.result as { id: string; key: CryptoKey } | undefined
      resolve(record?.key ?? null)
    }
    req.onerror = () => reject(req.error)
  })
}

function putStoredKey(store: IDBObjectStore, key: CryptoKey): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = store.put({ id: KEY_ID, key })
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

let _cachedKey: CryptoKey | null = null

/**
 * Retrieve (or generate on first use) the AES-GCM CryptoKey.
 * The key is non-exportable and stored in IndexedDB.
 */
export async function getEncryptionKey(): Promise<CryptoKey> {
  if (_cachedKey) return _cachedKey

  const idb = await openKeyStore()

  try {
    const tx = idb.transaction(STORE_NAME, 'readonly')
    const existing = await getStoredKey(tx.objectStore(STORE_NAME))
    if (existing) {
      _cachedKey = existing
      return existing
    }
  } catch {
    // Store may be empty — fall through to generation.
  }

  // Generate a new non-exportable key
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    false, // extractable = false
    ['encrypt', 'decrypt'],
  )

  const tx = idb.transaction(STORE_NAME, 'readwrite')
  await putStoredKey(tx.objectStore(STORE_NAME), key)
  _cachedKey = key
  logger.info('Generated new encryption key for API key storage', { context: 'crypto' })
  return key
}

/**
 * Encrypt a plaintext string. Returns an EncryptedValue object.
 * Returns null for empty strings (no point encrypting nothing).
 */
export async function encryptValue(plaintext: string): Promise<EncryptedValue | null> {
  if (!plaintext) return null

  const key = await getEncryptionKey()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(plaintext)

  const cipherBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded,
  )

  return {
    ct: bufferToBase64(cipherBuffer),
    iv: bufferToBase64(iv.buffer),
    __encrypted: true,
  }
}

/**
 * Decrypt an EncryptedValue back to a plaintext string.
 */
export async function decryptValue(encrypted: EncryptedValue): Promise<string> {
  const key = await getEncryptionKey()
  const iv = base64ToBuffer(encrypted.iv)
  const ct = base64ToBuffer(encrypted.ct)

  const plainBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(iv) },
    key,
    ct,
  )

  return new TextDecoder().decode(plainBuffer)
}

/**
 * Check whether a value is an EncryptedValue object.
 */
export function isEncrypted(value: unknown): value is EncryptedValue {
  return (
    typeof value === 'object' &&
    value !== null &&
    '__encrypted' in value &&
    (value as EncryptedValue).__encrypted === true
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (const b of bytes) {
    binary += String.fromCharCode(b)
  }
  return btoa(binary)
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}
