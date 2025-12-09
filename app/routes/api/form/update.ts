import type { JsonObject } from '@prisma/client/runtime/library'
import { data, redirect } from 'react-router'
import { prisma } from '~/db'
import { customResponse } from '~/lib/response'
import { authMiddleware, userContext } from '~/middleware/auth'
import { ROUTES } from '~/routes'
import { updateFormSchema } from '~/validation/form'
import type { Route } from './+types/update'

export const middleware: Route.MiddlewareFunction[] = [authMiddleware]

export const action = async ({ request, context }: Route.ActionArgs) => {
  const userData = context.get(userContext)

  if (!userData) {
    throw redirect(ROUTES.LOGOUT)
  }

  const formData = await request.formData()
  console.log('Form Data:', Object.fromEntries(formData))
  const validated = await updateFormSchema.parseAsync(Object.fromEntries(formData))

  const { formId, pageId, data: jsonObj } = validated

  await prisma.page.update({
    where: {
      formId,
      pageId,
    },
    data: {
      pageFields: jsonObj as JsonObject,
    },
  })

  return data(customResponse({ message: 'Form updated successfully' }), { status: 201 })
}
