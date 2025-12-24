import { data, redirect } from 'react-router'
import { prisma } from '~/db'
import { customResponse } from '~/lib/response'
import { authMiddleware, userContext } from '~/middleware/auth'
import { ROUTES } from '~/routes'
import { updateFinalPageSchema } from '~/validation/form'
import type { Route } from './+types/final.update'

export const middleware: Route.MiddlewareFunction[] = [authMiddleware]

export const action = async ({ request, context }: Route.ActionArgs) => {
  const userData = context.get(userContext)

  if (!userData) {
    throw redirect(ROUTES.LOGOUT)
  }

  const formData = await request.formData()
  const validated = await updateFinalPageSchema.parseAsync(Object.fromEntries(formData))

  const { formId, finalTitle, finalDescription } = validated

  await prisma.form.update({
    where: {
      formId,
    },
    data: {
      finalTitle,
      finalDescription,
    },
  })

  return data(customResponse({ message: 'Form final page updated successfully' }), { status: 201 })
}
