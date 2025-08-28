import pino from 'pino'

const getLogLevel = () => {
  const env = process.env.NODE_ENV
  const logLevel = process.env.LOG_LEVEL
  
  if (logLevel) {
    return logLevel
  }
  
  switch (env) {
    case 'production':
      return 'warn'
    case 'test':
      return 'error'
    case 'development':
    default:
      return 'debug'
  }
}

const createLogger = () => {
  const isProduction = process.env.NODE_ENV === 'production'
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  const baseConfig: pino.LoggerOptions = {
    level: getLogLevel(),
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: {
      paths: ['password', 'token', 'api_key', 'apiKey', 'secret'],
      censor: '[REDACTED]',
    },
  }
  
  if (isProduction) {
    return pino({
      ...baseConfig,
      formatters: {
        level: (label) => ({ level: label }),
        bindings: (bindings) => ({
          pid: bindings.pid,
          hostname: bindings.hostname,
          service: 'docbase',
        }),
      },
      serializers: {
        err: pino.stdSerializers.err,
        req: pino.stdSerializers.req,
        res: pino.stdSerializers.res,
      },
    })
  }
  
  if (isDevelopment) {
    return pino({
      ...baseConfig,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
    })
  }
  
  return pino(baseConfig)
}

const pinoLogger = createLogger()

// Create a wrapper with proper TypeScript support
export const logger = {
  debug: (message: string, obj?: any) => {
    if (obj) {
      pinoLogger.debug(obj, message)
    } else {
      pinoLogger.debug(message)
    }
  },
  info: (message: string, obj?: any) => {
    if (obj) {
      pinoLogger.info(obj, message)
    } else {
      pinoLogger.info(message)
    }
  },
  warn: (message: string, obj?: any) => {
    if (obj) {
      pinoLogger.warn(obj, message)
    } else {
      pinoLogger.warn(message)
    }
  },
  error: (message: string, obj?: any) => {
    if (obj) {
      pinoLogger.error(obj, message)
    } else {
      pinoLogger.error(message)
    }
  },
}

export type Logger = typeof logger