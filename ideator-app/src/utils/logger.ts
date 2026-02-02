/**
 * Structured logger utility for the Ideator app.
 * Provides consistent logging format with timestamps and context.
 */

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'

interface LogOptions {
  context?: string
  data?: unknown
}

function isLogOptions(value: unknown): value is LogOptions {
  return (
    typeof value === 'object' &&
    value !== null &&
    ('context' in value || 'data' in value)
  )
}

function normalizeOptions(optionsOrError?: LogOptions | unknown): LogOptions | undefined {
  if (optionsOrError === undefined) return undefined
  if (isLogOptions(optionsOrError)) return optionsOrError
  return { data: optionsOrError }
}

function formatMessage(
  level: LogLevel,
  message: string,
  options?: LogOptions
): string {
  const timestamp = new Date().toISOString()
  const context = options?.context ? `[${options.context}]` : ''

  let formatted = `[${timestamp}] [${level}] ${context} ${message}`

  if (options?.data !== undefined) {
    formatted += ` ${JSON.stringify(options.data)}`
  }

  return formatted
}

export const logger = {
  debug(message: string, optionsOrError?: LogOptions | unknown): void {
    console.debug(formatMessage('DEBUG', message, normalizeOptions(optionsOrError)))
  },

  info(message: string, optionsOrError?: LogOptions | unknown): void {
    console.info(formatMessage('INFO', message, normalizeOptions(optionsOrError)))
  },

  warn(message: string, optionsOrError?: LogOptions | unknown): void {
    console.warn(formatMessage('WARN', message, normalizeOptions(optionsOrError)))
  },

  error(message: string, optionsOrError?: LogOptions | unknown): void {
    console.error(formatMessage('ERROR', message, normalizeOptions(optionsOrError)))
  },
}
