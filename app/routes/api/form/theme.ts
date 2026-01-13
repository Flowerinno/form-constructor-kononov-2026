import { data, UNSAFE_invariant } from 'react-router'
import { REDIS_KEYS } from '~/core/constant'
import { prisma } from '~/db'
import { deleteRedisByPattern } from '~/lib/redis'
import { customResponse } from '~/lib/response'
import { authMiddleware, userContext } from '~/middleware/auth'
import { updateThemeFormSchema } from '~/validation/form'
import type { Route } from './+types/theme'

export const middleware: Route.MiddlewareFunction[] = [authMiddleware]

export const action = async ({ request, context }: Route.ActionArgs) => {
  const userData = context.get(userContext)
  UNSAFE_invariant(userData, 'User must be authenticated to change theme form')

  const formData = await request.formData()
  const { formId, theme } = await updateThemeFormSchema.parseAsync(Object.fromEntries(formData))

  await prisma.form.update({
    where: {
      formId,
    },
    data: {
      theme,
    },
  })

  await deleteRedisByPattern(REDIS_KEYS.FORM_PAGE_BY_NUMBER(formId, '*'))

  return data(customResponse({ message: 'Form theme changed successfully' }), { status: 201 })
}
