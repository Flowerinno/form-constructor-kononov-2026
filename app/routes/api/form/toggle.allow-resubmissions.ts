import { data, UNSAFE_invariant } from 'react-router'
import { prisma } from '~/db'
import { customResponse } from '~/lib/response'
import { authMiddleware, userContext } from '~/middleware/auth'
import { toggleFormSchema } from '~/validation/form'
import type { Route } from './+types/toggle.allow-resubmissions'

export const middleware: Route.MiddlewareFunction[] = [authMiddleware]

export const action = async ({ request, context }: Route.ActionArgs) => {
  const userData = context.get(userContext)
  UNSAFE_invariant(userData, 'User must be authenticated to toggle publish status')

  const formData = await request.formData()
  const { formId } = await toggleFormSchema.parseAsync(Object.fromEntries(formData))

  const form = await prisma.form.findUniqueOrThrow({
    where: {
      formId,
    },
    select: {
      allowResubmission: true,
    },
  })

  await prisma.form.update({
    where: {
      formId,
    },
    data: {
      allowResubmission: !form.allowResubmission,
    },
  })

  return data(customResponse({ message: 'Form toggled successfully' }), { status: 201 })
}
