import { redirect, UNSAFE_invariant } from 'react-router'
import { destroySession, getSession } from '~/lib/session'
import { ROUTES } from '~/routes'
import { invalidateUserSessions } from '~/services/user/session.service'
import type { Route } from './+types/logout'

export const loader = async ({ request }: Route.LoaderArgs) => {
  const session = await getSession(request.headers.get('Cookie'))
  UNSAFE_invariant(session.get('userId'), 'User ID is required to logout')

  await invalidateUserSessions(session.get('userId')!)

  throw redirect(ROUTES.AUTH, {
    status: 302,
    headers: {
      'Set-Cookie': await destroySession(session),
    },
  })
}
