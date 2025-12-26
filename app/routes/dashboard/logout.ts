import { redirect } from 'react-router'
import { destroySession, getSession } from '~/lib/session'
import { ROUTES } from '~/routes'
import type { Route } from './+types/logout'

export const loader = async ({ request }: Route.LoaderArgs) => {
  const session = await getSession(request.headers.get('Cookie'))

  throw redirect(ROUTES.AUTH, {
    status: 302,
    headers: {
      'Set-Cookie': await destroySession(session),
    },
  })
}
