import type { Route } from './+types/submissions.submit'

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData()
  console.log('Form Data:', formData)
  return { message: 'Hello World' }
}
