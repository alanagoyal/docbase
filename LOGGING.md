# Logging Configuration

This document outlines the logging system implemented for production hardening.

## Overview

The application uses Pino for structured logging with environment-based configuration, automatic log rotation, and security features.

## Features

### 1. Environment-Based Configuration
- **Development**: Pretty-printed logs with colors, debug level
- **Production**: JSON structured logs, warn level, automatic rotation
- **Test**: Error level only

### 2. Log Levels
- `debug`: Detailed debugging information (development only)
- `info`: General information about application behavior  
- `warn`: Warning messages that may indicate issues
- `error`: Error conditions that should be investigated

### 3. Security Features
- **Automatic Redaction**: Sensitive fields like passwords, tokens, API keys are automatically redacted
- **Secure Log Storage**: Production logs are stored with restricted permissions (750)
- **Log Rotation**: Daily rotation with 7-day retention, 10MB size limit per file

### 4. Production Log Management
- **Location**: `/var/log/docbase/` (configurable via `LOG_DIR` env var)
- **Rotation**: Daily rotation, 7 days retention
- **Size Limit**: 10MB per log file
- **Permissions**: 750 (read/write for owner, read for group)

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment mode |
| `LOG_LEVEL` | Auto-detected | Override log level |
| `LOG_DIR` | `/var/log/docbase` | Log directory for production |

## Usage

### Server-Side Logging
```typescript
import { logger } from '@/lib/logger'

logger.info('User action completed', { userId, action })
logger.error('Database error', { error, query })
logger.warn('Rate limit approaching', { userId, requests })
```

### Client-Side Logging
```typescript
import { clientLogger } from '@/lib/client-logger'

clientLogger.error('API request failed', { status, url })
clientLogger.info('User interaction', { component, action })
```

## Deployment Setup

### 1. Create Log Directory
```bash
sudo mkdir -p /var/log/docbase
sudo chown -R $USER:$USER /var/log/docbase
sudo chmod 750 /var/log/docbase
```

### 2. Set Environment Variables
```bash
export NODE_ENV=production
export LOG_LEVEL=warn
export LOG_DIR=/var/log/docbase
```

### 3. Log Monitoring
Consider implementing log monitoring solutions like:
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Grafana Loki
- Cloud logging services (AWS CloudWatch, GCP Cloud Logging)

## Log Format

### Development
```
[2024-01-15 10:30:45] INFO: User logged in
    userId: "abc123"
    ip: "192.168.1.1"
```

### Production
```json
{
  "level": "info",
  "time": "2024-01-15T15:30:45.123Z",
  "pid": 12345,
  "hostname": "app-server-01",
  "service": "docbase",
  "msg": "User logged in",
  "userId": "abc123",
  "ip": "192.168.1.1"
}
```

## Migration from console.log

All console.log/console.error statements have been replaced with structured logging:

- ✅ 59 console statements replaced across 23 files
- ✅ API routes use server-side logger
- ✅ React components use client-side logger  
- ✅ Automatic environment variable validation
- ✅ Removed all dummy key fallbacks

## Troubleshooting

### Log Directory Permission Issues
```bash
sudo chown -R www-data:www-data /var/log/docbase
sudo chmod -R 750 /var/log/docbase
```

### Log Rotation Not Working
Check if the application has write permissions to the log directory and sufficient disk space.

### High Log Volume
Adjust log level in production:
```bash
export LOG_LEVEL=error  # Only log errors
```