import { redirect, UNSAFE_invariant } from 'react-router'
import { prisma } from '~/db'
import { authMiddleware, userContext } from '~/middleware/auth'
import { ROUTES } from '~/routes'
import { deleteFormSchema } from '~/validation/form'
import type { Route } from './+types/delete'
import { deleteRedisByPattern } from '~/lib/redis'
import { REDIS_KEYS } from '~/core/constant'

export const middleware: Route.MiddlewareFunction[] = [authMiddleware]

export const action = async ({ request, context }: Route.ActionArgs) => {
  const userData = context.get(userContext)
  UNSAFE_invariant(userData, 'userData is required')

  const formData = await request.formData()
  const { formId } = await deleteFormSchema.parseAsync(Object.fromEntries(formData))

  await prisma.form.delete({
    where: {
      formId,
    },
  })

  await deleteRedisByPattern(REDIS_KEYS.FORM_WILDCARD(formId))

  throw redirect(ROUTES.DASHBOARD)
}
