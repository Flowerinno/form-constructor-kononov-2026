import type { Route } from './+types/submission'

export const loader = async ({ request }: Route.LoaderArgs) => {
  const formData = await request.formData()
  console.log('Form Data:', formData)
  return { message: 'Hello World' }
}
