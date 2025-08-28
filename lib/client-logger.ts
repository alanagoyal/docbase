type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const getLogLevel = (): LogLevel => {
  if (typeof window !== 'undefined') {
    const logLevel = localStorage.getItem('logLevel') as LogLevel
    if (logLevel && ['debug', 'info', 'warn', 'error'].includes(logLevel)) {
      return logLevel
    }
  }
  
  // Default to 'warn' in production, 'debug' in development
  return process.env.NODE_ENV === 'production' ? 'warn' : 'debug'
}

const shouldLog = (level: LogLevel, currentLevel: LogLevel): boolean => {
  const levels = ['debug', 'info', 'warn', 'error']
  return levels.indexOf(level) >= levels.indexOf(currentLevel)
}

const createClientLogger = () => {
  const currentLevel = getLogLevel()
  
  return {
    debug: (message: string, meta?: any) => {
      if (shouldLog('debug', currentLevel)) {
        if (process.env.NODE_ENV !== 'production') {
          console.log(`[DEBUG] ${message}`, meta || '')
        }
      }
    },
    
    info: (message: string, meta?: any) => {
      if (shouldLog('info', currentLevel)) {
        if (process.env.NODE_ENV !== 'production') {
          console.info(`[INFO] ${message}`, meta || '')
        }
      }
    },
    
    warn: (message: string, meta?: any) => {
      if (shouldLog('warn', currentLevel)) {
        console.warn(`[WARN] ${message}`, meta || '')
      }
    },
    
    error: (message: string, meta?: any) => {
      if (shouldLog('error', currentLevel)) {
        console.error(`[ERROR] ${message}`, meta || '')
      }
    }
  }
}

export const clientLogger = createClientLogger()
export type ClientLogger = typeof clientLogger