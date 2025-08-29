// Demo of the simple logger
const { logger } = require('./lib/logger.ts')

console.log('=== DEVELOPMENT MODE (readable) ===')
process.env.NODE_ENV = 'development'

logger.info('User logged in', { userId: '123', method: 'oauth' })
logger.error('Payment failed', { 
  userId: '123', 
  amount: 99.99,
  error: 'Card declined',
  apiKey: 'sk_live_secret123'  // This will be redacted
})

console.log('\n=== PRODUCTION MODE (JSON) ===')
process.env.NODE_ENV = 'production'

logger.warn('Rate limit approaching', { userId: '123', requests: 950 })
logger.error('Database timeout', { 
  query: 'SELECT * FROM users',
  timeout: '5s',
  password: 'secret123'  // This will be redacted
})