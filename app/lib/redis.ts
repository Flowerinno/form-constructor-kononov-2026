import { createClient } from 'redis'
import { TIME } from '~/core/constant'
import type { UserSession } from '~/services/user/types'
import { logger } from './logger'

export const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
})

await redisClient.connect().catch((err) => {
  logger.error(err, 'Failed to connect to Redis')
})
redisClient.on('error', (err) => {
  logger.error(err, 'Redis Client Error')
})

export const setRedisUserSession = async (
  sessionId: string,
  data: Record<string, any>,
  ttlSeconds = TIME.ONE_WEEK / 1000,
) => {
  await redisClient.set(`session:${sessionId}`, JSON.stringify(data), {
    EX: ttlSeconds,
  })
}

export const checkRedisUserSession = async (sessionId: string): Promise<UserSession> => {
  const data = await redisClient.get(`session:${sessionId}`)
  if (!data) return null

  const parsed = JSON.parse(data) as UserSession

  if (parsed?.expiresAt && new Date(parsed.expiresAt) < new Date() && !parsed.expiredAt) {
    await deleteRedisUserSession(sessionId)
    return null
  }

  return parsed
}

export const deleteRedisUserSession = async (sessionId: string) => {
  await redisClient.del(`session:${sessionId}`)
}
