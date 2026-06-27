/* eslint-disable no-console */
type LogLevel = 'error' | 'warn' | 'info' | 'debug'

type LogContext = Record<string, unknown>

type LogEntry = {
  level: LogLevel
  message: string
  timestamp: string
  service: 'web'
  [key: string]: unknown
}

const isDev = process.env.NODE_ENV === 'development'

function buildEntry(level: LogLevel, message: string, context?: LogContext): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    service: 'web',
    ...context,
  }
}

export const logger = {
  error(message: string, context?: LogContext): void {
    if (isDev) {
      console.error(`[ERROR] ${message}`, context ?? '')
    } else {
      console.error(JSON.stringify(buildEntry('error', message, context)))
    }
  },

  warn(message: string, context?: LogContext): void {
    if (isDev) {
      console.warn(`[WARN] ${message}`, context ?? '')
    } else {
      console.warn(JSON.stringify(buildEntry('warn', message, context)))
    }
  },

  info(message: string, context?: LogContext): void {
    if (isDev) {
      console.info(`[INFO] ${message}`, context ?? '')
    } else {
      console.info(JSON.stringify(buildEntry('info', message, context)))
    }
  },

  debug(message: string, context?: LogContext): void {
    if (isDev) {
      console.debug(`[DEBUG] ${message}`, context ?? '')
    }
  },
}
