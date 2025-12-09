import { data, UNSAFE_invariant } from 'react-router'
import { customResponse } from '~/lib/response'
import { authMiddleware, userContext } from '~/middleware/auth'
import { toggleFormPublish } from '~/services/form/form.service'
import { toggleFormSchema } from '~/validation/form'
import type { Route } from './+types/toggle'

export const middleware: Route.MiddlewareFunction[] = [authMiddleware]

export const action = async ({ request, context }: Route.ActionArgs) => {
  const formData = await request.formData()
  const { formId } = await toggleFormSchema.parseAsync(Object.fromEntries(formData))

  const userData = context.get(userContext)
  UNSAFE_invariant(userData, 'User must be authenticated to toggle publish status')

  await toggleFormPublish(formId)

  return data(customResponse({ message: 'Form toggled successfully' }), { status: 201 })
}
