import { data, UNSAFE_invariant } from 'react-router'
import { HTTP_STATUS_CODES, REDIS_KEYS } from '~/core/constant'
import { deleteRedisByPattern } from '~/lib/redis'
import { customResponse } from '~/lib/response'
import { authMiddleware, userContext } from '~/middleware/auth'
import { toggleFormPublish } from '~/services/form/form.service'
import { toggleFormSchema } from '~/validation/form'
import type { Route } from './+types/toggle'

export const middleware: Route.MiddlewareFunction[] = [authMiddleware]

export const action = async ({ request, context }: Route.ActionArgs) => {
  const userData = context.get(userContext)
  UNSAFE_invariant(userData, 'User must be authenticated to toggle publish status')

  const formData = await request.formData()
  const { formId } = await toggleFormSchema.parseAsync(Object.fromEntries(formData))

  await toggleFormPublish(formId)

  await deleteRedisByPattern(REDIS_KEYS.FORM_PAGE_BY_NUMBER(formId, '*'))

  return data(customResponse({ message: 'Form toggled successfully' }), {
    status: HTTP_STATUS_CODES.CREATED,
  })
}
