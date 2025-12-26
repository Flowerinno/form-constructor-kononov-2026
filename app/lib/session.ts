import { createCookieSessionStorage, type Session } from 'react-router'
import { TIME } from '~/core/constant'
import { invalidateUserSessions } from '~/services/user/session.service'
import { deleteRedisUserSession, setRedisUserSession } from './redis'

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
    secure: false,
  },
})

const setSessionData = async (session: Session, sessionData: SessionData) => {
  session.set('userId', sessionData.userId)
  session.set('email', sessionData.email)
  session.set('name', sessionData.name)
  session.set('sessionId', sessionData.sessionId)
  await setRedisUserSession(sessionData.sessionId, sessionData)
}

const customDestroySession = async (session: Session) => {
  await invalidateUserSessions(session.get('userId'))
  await deleteRedisUserSession(session.get('sessionId'))
  return destroySession(session)
}

export { commitSession, customDestroySession as destroySession, getSession, setSessionData }
