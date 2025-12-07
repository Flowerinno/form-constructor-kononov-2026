import { data, UNSAFE_invariant } from 'react-router'
import { customResponse } from '~/lib/response'
import { authMiddleware, userContext } from '~/middleware/auth'
import { createUserForm } from '~/services/form/form.service'
import { createFormSchema } from '~/validation/form'
import type { Route } from './+types/form.create'

export const middleware: Route.MiddlewareFunction[] = [authMiddleware]

export const action = async ({ request, context }: Route.ActionArgs) => {
  const formData = await request.formData()
  const validated = await createFormSchema.parseAsync(Object.fromEntries(formData))

  const userData = context.get(userContext)
  UNSAFE_invariant(userData, 'User must be authenticated to create a form')

  await createUserForm(validated, userData.userId)

  return data(customResponse({ message: 'Form created successfully' }), { status: 201 })
}
