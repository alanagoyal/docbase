type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const getLogLevel = (): LogLevel => {
  const logLevel = process.env.LOG_LEVEL as LogLevel
  if (logLevel && ['debug', 'info', 'warn', 'error'].includes(logLevel)) {
    return logLevel
  }
  
  switch (process.env.NODE_ENV) {
    case 'production':
      return 'warn'
    case 'test':
      return 'error'
    default:
      return 'debug'
  }
}

const shouldLog = (level: LogLevel): boolean => {
  const levels = ['debug', 'info', 'warn', 'error']
  const currentLevel = getLogLevel()
  return levels.indexOf(level) >= levels.indexOf(currentLevel)
}

const redactSecrets = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj
  
  const sensitiveKeys = ['password', 'token', 'api_key', 'apiKey', 'secret', 'key']
  const redacted = { ...obj }
  
  for (const key in redacted) {
    if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
      redacted[key] = '[REDACTED]'
    }
  }
  
  return redacted
}

const formatMessage = (level: LogLevel, message: string, meta?: any): string => {
  const timestamp = new Date().toISOString()
  const safeMeta = meta ? redactSecrets(meta) : undefined
  
  if (process.env.NODE_ENV === 'production') {
    // Structured JSON for production
    return JSON.stringify({
      timestamp,
      level,
      message,
      service: 'docbase',
      ...safeMeta
    })
  } else {
    // Human readable for development
    const metaStr = safeMeta ? ` ${JSON.stringify(safeMeta, null, 2)}` : ''
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`
  }
}

export const logger = {
  debug: (message: string, meta?: any) => {
    if (shouldLog('debug')) {
      console.log(formatMessage('debug', message, meta))
    }
  },
  
  info: (message: string, meta?: any) => {
    if (shouldLog('info')) {
      console.log(formatMessage('info', message, meta))
    }
  },
  
  warn: (message: string, meta?: any) => {
    if (shouldLog('warn')) {
      console.warn(formatMessage('warn', message, meta))
    }
  },
  
  error: (message: string, meta?: any) => {
    if (shouldLog('error')) {
      console.error(formatMessage('error', message, meta))
    }
  }
}

export type Logger = typeof logger