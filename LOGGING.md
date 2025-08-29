# Simple Production Logging

A lightweight logging solution that replaces console statements with structured, environment-aware logging.

## Key Benefits

✅ **Zero Dependencies** - No external logging libraries needed  
✅ **Environment Aware** - Different log levels and formats for dev vs production  
✅ **Security** - Automatic redaction of sensitive data (passwords, tokens, API keys)  
✅ **Structured** - JSON format in production for easy parsing and monitoring  
✅ **Familiar** - Still uses console.log/console.error under the hood  

## How It Works

### Development (Readable Format)
```
[2024-01-15T10:30:45.123Z] INFO: User logged in {
  "userId": "abc123",
  "ip": "192.168.1.1"
}
```

### Production (JSON Format)  
```json
{"timestamp":"2024-01-15T10:30:45.123Z","level":"info","message":"User logged in","service":"docbase","userId":"abc123","ip":"192.168.1.1"}
```

## Usage

### Server-Side (API routes, pages)
```typescript
import { logger } from '@/lib/logger'

// Simple message
logger.info('User action completed')

// With metadata
logger.error('Database connection failed', { 
  userId: '123', 
  database: 'payments',
  error: error.message 
})

// Sensitive data automatically redacted
logger.debug('User credentials', { 
  username: 'john',
  password: 'secret123'  // -> '[REDACTED]'
})
```

### Client-Side (React components)
```typescript
import { clientLogger } from '@/lib/client-logger'

clientLogger.error('API request failed', { 
  url: '/api/users', 
  status: 500 
})
```

## Log Levels

| Environment | Default Level | What Gets Logged |
|-------------|---------------|------------------|
| development | debug | All messages (debug, info, warn, error) |
| production  | warn  | Only warnings and errors |
| test        | error | Only errors |

Override with: `LOG_LEVEL=info`

## Security Features

**Automatic Secret Redaction:**
- `password`, `token`, `api_key`, `apiKey`, `secret`, `key`
- Any field containing these terms gets replaced with `[REDACTED]`

```typescript
logger.info('Payment processed', {
  amount: 100,
  apiKey: 'sk_live_123',     // -> '[REDACTED]'
  userToken: 'token_456'     // -> '[REDACTED]'
})
```

## Production Benefits

### 1. Monitoring Integration
Production logs are JSON formatted, making them easy to:
- Parse with log aggregators (ELK, Splunk, DataDog)
- Search and filter by fields
- Set up automated alerts

### 2. Performance
- Log level filtering prevents unnecessary logging in production
- No external dependencies = faster startup
- Still uses native console methods = no performance overhead

### 3. Debugging
Structured metadata makes production debugging much easier:
```typescript
// Instead of: console.log("Error in payment for user 123")
logger.error('Payment processing failed', {
  userId: '123',
  amount: 99.99,
  paymentMethod: 'credit_card',
  errorCode: 'CARD_DECLINED',
  transactionId: 'txn_abc123'
})
```

## Migration Summary

**Before (59+ scattered console statements):**
```javascript
console.log("User login successful")
console.error("Payment failed:", error)
console.log("Processing order for", userId, "amount:", amount)
```

**After (Structured logging):**
```typescript
logger.info('User login successful', { userId, loginMethod })
logger.error('Payment processing failed', { userId, amount, error: error.message })
logger.info('Order processing started', { userId, amount, orderId })
```

## Implementation Details

- **86 lines of code** - Simple, maintainable
- **No runtime dependencies** - Zero impact on bundle size
- **Environment detection** - Automatically adjusts behavior
- **Type safe** - Full TypeScript support
- **Same API everywhere** - One logger for all files

## Quick Setup

1. Import and use:
```typescript
import { logger } from '@/lib/logger'
logger.info('Hello production!')
```

2. Set log level (optional):
```bash
export LOG_LEVEL=warn
```

3. That's it! 🎉

This approach gives you 80% of the benefits of complex logging solutions with 20% of the complexity.