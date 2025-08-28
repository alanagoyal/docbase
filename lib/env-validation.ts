import { z } from 'zod'
import { logger } from './logger'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required').optional(),
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL').optional(),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY is required').optional(),
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required').optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).optional(),
})

export function validateEnvironmentVariables() {
  try {
    const env = envSchema.parse(process.env)
    logger.info('Environment variables validated successfully')
    return env
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
      logger.error(`Environment validation failed: ${missingVars}`)
      
      if (process.env.NODE_ENV === 'production') {
        throw new Error(`Required environment variables are missing: ${missingVars}`)
      } else {
        logger.warn('Some environment variables are missing, but continuing in development mode')
      }
    } else {
      logger.error('Unknown error during environment validation', error)
      throw error
    }
  }
}

export type ValidatedEnv = z.infer<typeof envSchema>