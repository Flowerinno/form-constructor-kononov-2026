import { createCookieSessionStorage, type Session } from 'react-router'
import { REDIS_KEYS, TIME } from '~/core/constant'
import { invalidateUserSessions } from '~/services/user/session.service'
import type { UserSession } from '~/services/user/types'
import { deleteRedisEntry, setRedisEntry } from './redis'

export type SessionData = {
  userId: string
  email: string
  name: string | null
  sessionId: string
}

export type SessionFlashData = {
  error: string
}

export const SESSION_COOKIE_NAME = 'me_session'
const { getSession, commitSession, destroySession } = createCookieSessionStorage<
  SessionData,
  SessionFlashData
>({
  cookie: {
    name: SESSION_COOKIE_NAME,
    httpOnly: true,
    maxAge: TIME.ONE_WEEK,
    path: '/',
    sameSite: 'lax',
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === 'production',
  },
})

const setSessionData = async (session: Session, sessionData: UserSession) => {
  if (!sessionData) return
  session.set('userId', sessionData.userId)
  session.set('email', sessionData.user.email)
  session.set('name', sessionData.user.name)
  session.set('sessionId', sessionData.id)
  await setRedisEntry(REDIS_KEYS.USER_SESSION(sessionData.id), sessionData, TIME.ONE_WEEK / 1000)
}

const customDestroySession = async (session: Session) => {
  await invalidateUserSessions(session.get('userId'))
  await deleteRedisEntry(REDIS_KEYS.USER_SESSION(session.get('sessionId')))
  return destroySession(session)
}

export { commitSession, customDestroySession as destroySession, getSession, setSessionData }
