import { redirect } from 'react-router'
import { destroySession, getSession } from '~/lib/session'
import { ROUTES } from '~/routes'
import type { Route } from './+types/logout'
import { HTTP_STATUS_CODES } from '~/core/constant'

export const loader = async ({ request }: Route.LoaderArgs) => {
  const session = await getSession(request.headers.get('Cookie'))

  throw redirect(ROUTES.AUTH, {
    status: HTTP_STATUS_CODES.FOUND,
    headers: {
      'Set-Cookie': await destroySession(session),
    },
  })
}
