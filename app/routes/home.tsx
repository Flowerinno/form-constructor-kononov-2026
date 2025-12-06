import { redirect } from 'react-router'
import { ROUTES } from '~/routes'

export const loader = async () => {
  throw redirect(ROUTES.AUTH)
}
export default function Home() {
  return <p>redirect</p>
}
