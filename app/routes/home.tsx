import { redirect } from 'react-router'
import { ROUTES } from '~/routes'
import type { Route } from './+types/home'

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  throw redirect(ROUTES.AUTH)
  return { data: null }
}

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Form constructor' }]
}

export default function Home() {
  return <p>redirect</p>
}
