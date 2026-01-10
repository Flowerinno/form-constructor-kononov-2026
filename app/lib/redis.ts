import { createClient } from 'redis'
import { REDIS_KEYS, TIME } from '~/core/constant'
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

export const checkRedisUserSession = async (sessionId: string): Promise<UserSession> => {
  const data = await getRedisEntry<UserSession>(REDIS_KEYS.USER_SESSION(sessionId))
  if (!data) return null

  const parsed = data as UserSession

  if (parsed?.expiresAt && new Date(parsed.expiresAt) < new Date() && !parsed.expiredAt) {
    await deleteRedisEntry(REDIS_KEYS.USER_SESSION(sessionId))
    return null
  }

  return parsed
}

export const setRedisEntry = async (
  key: string,
  value: Record<string, any> | string | number | null,
  ttlSeconds = TIME.TEN_MINUTES / 1000,
) => {
  if (!key || !value) return
  await redisClient.set(key, JSON.stringify(value), {
    EX: ttlSeconds,
  })
}

export const getRedisEntry = async <T>(key: string): Promise<T | null> => {
  const data = await redisClient.get(key)
  if (!data) return null
  return JSON.parse(data) as T
}

export const deleteRedisEntry = async (key: string) => {
  await redisClient.del(key)
}

export const deleteRedisByPattern = async (pattern: string) => {
  const stream = redisClient.scanIterator({
    MATCH: pattern,
  })

  for await (const key of stream) {
    if (typeof key !== 'string') continue
    await redisClient.del(key)
  }
}
