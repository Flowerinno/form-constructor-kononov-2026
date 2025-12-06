import { createCookieSessionStorage, type Session } from 'react-router'
import { TIME } from '~/core/constant'

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

const setSessionData = (session: Session, sessionData: SessionData) => {
  session.set('userId', sessionData.userId)
  session.set('email', sessionData.email)
  session.set('name', sessionData.name)
  session.set('sessionId', sessionData.sessionId)
}

export { commitSession, destroySession, getSession, setSessionData }
