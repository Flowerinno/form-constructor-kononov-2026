import { createContext, redirect } from 'react-router'
import { destroySession, getSession, type SessionData } from '~/lib/session'
import { ROUTES } from '~/routes'
import { getUserSession } from '~/services/user/session.service'
import type { Route } from '../+types/root'

export const userContext = createContext<SessionData | null>(null)

export const authMiddleware = async ({ request, context }: Route.LoaderArgs) => {
  const reqSession = await getSession(request.headers.get('Cookie'))
  const userSession = await getUserSession(reqSession.get('sessionId'))

  if (!userSession || !userSession.userId) {
    throw redirect(ROUTES.AUTH, {
      headers: {
        'Set-Cookie': await destroySession(reqSession),
      },
    })
  }

  context.set(userContext, {
    userId: userSession.user.userId,
    email: userSession.user.email,
    name: userSession.user.name,
    sessionId: userSession.id,
  })
}
