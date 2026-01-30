/**
 * Structured logger utility for the Ideator app.
 * Provides consistent logging format with timestamps and context.
 */

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'

interface LogOptions {
  context?: string
  data?: unknown
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
  debug(message: string, options?: LogOptions): void {
    console.debug(formatMessage('DEBUG', message, options))
  },

  info(message: string, options?: LogOptions): void {
    console.info(formatMessage('INFO', message, options))
  },

  warn(message: string, options?: LogOptions): void {
    console.warn(formatMessage('WARN', message, options))
  },

  error(message: string, options?: LogOptions): void {
    console.error(formatMessage('ERROR', message, options))
  },
}
