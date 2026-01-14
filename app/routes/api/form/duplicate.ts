import { redirect, UNSAFE_invariant } from 'react-router'
import { prisma } from '~/db'
import { authMiddleware, userContext } from '~/middleware/auth'
import { ROUTES } from '~/routes'
import { duplicateFormSchema } from '~/validation/form'
import type { Route } from './+types/duplicate'

export const middleware: Route.MiddlewareFunction[] = [authMiddleware]

export const action = async ({ request, context }: Route.ActionArgs) => {
  const userData = context.get(userContext)
  UNSAFE_invariant(userData, 'userData is required')

  const formData = await request.formData()
  const { formId, title, description } = await duplicateFormSchema.parseAsync(
    Object.fromEntries(formData),
  )

  const form = await prisma.form.findUniqueOrThrow({
    where: { formId },
    include: {
      pages: true,
    },
  })

  await prisma.form.create({
    data: {
      title,
      description: description ?? '',
      creatorId: userData.userId,
      pagesTotal: form.pagesTotal,
      pages: {
        createMany: {
          data: form.pages.map((p) => ({
            title: p.title ?? 'Untitled Page',
            pageNumber: p.pageNumber,
            pageFields: p.pageFields as string,
          })),
        },
      },
      finalTitle: form.finalTitle,
      finalDescription: form.finalDescription,
    },
  })

  throw redirect(ROUTES.DASHBOARD)
}
