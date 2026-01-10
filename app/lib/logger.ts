import pino from 'pino'
export const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: process.env.NODE_ENV === 'development',
    },
  },
})

export const logError = ({
  error,
  meta = {},
  message,
}: {
  error: unknown
  meta?: Record<string, string | number | null>
  message: string
}) => {
  return logger.error({
    cause: error,
    stack: error instanceof Error ? error.stack : undefined,
    message,
    meta,
    level: 'error',
    timestamp: new Date().toISOString(),
  })
}
