import { redirect, UNSAFE_invariant } from 'react-router'
import { prisma } from '~/db'
import { authMiddleware, userContext } from '~/middleware/auth'
import { ROUTES } from '~/routes'
import { deleteFormSchema } from '~/validation/form'
import type { Route } from './+types/delete'

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

  throw redirect(ROUTES.DASHBOARD)
}
