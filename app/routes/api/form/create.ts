import { data, UNSAFE_invariant } from 'react-router'
import { HTTP_STATUS_CODES } from '~/core/constant'
import { customResponse } from '~/lib/response'
import { authMiddleware, userContext } from '~/middleware/auth'
import { createUserForm } from '~/services/form/form.service'
import { createFormSchema } from '~/validation/form'
import type { Route } from './+types/create'

export const middleware: Route.MiddlewareFunction[] = [authMiddleware]

export const action = async ({ request, context }: Route.ActionArgs) => {
  const userData = context.get(userContext)
  UNSAFE_invariant(userData, 'User must be authenticated to create a form')

  const formData = await request.formData()
  const validated = await createFormSchema.parseAsync(Object.fromEntries(formData))

  await createUserForm(validated, userData.userId)

  return data(customResponse({ message: 'Form created successfully' }), {
    status: HTTP_STATUS_CODES.CREATED,
  })
}
