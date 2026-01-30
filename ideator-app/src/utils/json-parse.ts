/**
 * Attempt to parse JSON from a string, falling back to extracting
 * JSON from markdown code blocks if direct parsing fails.
 */
export function parseJsonSafe<T>(raw: string): T {
  try {
    return JSON.parse(raw) as T
  } catch {
    const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (match?.[1]) {
      return JSON.parse(match[1].trim()) as T
    }
    throw new Error('Failed to parse JSON from LLM response')
  }
}
