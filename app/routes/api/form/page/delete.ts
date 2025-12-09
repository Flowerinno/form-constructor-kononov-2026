import { redirect, UNSAFE_invariant } from 'react-router'
import { prisma } from '~/db'
import { authMiddleware, userContext } from '~/middleware/auth'
import { ROUTES } from '~/routes'
import { deletePageSchema } from '~/validation/form'
import type { Route } from '../+types/delete'

export const middleware: Route.MiddlewareFunction[] = [authMiddleware]

export const action = async ({ request, context }: Route.ActionArgs) => {
  const userData = context.get(userContext)
  UNSAFE_invariant(userData, 'User must be authenticated to delete page')

  const formData = await request.formData()
  const { formId, pageId } = await deletePageSchema.parseAsync(Object.fromEntries(formData))

  const formWithPages = await prisma.form.findUnique({
    where: { formId },
    include: {
      pages: true,
    },
  })

  const pageToDelete = formWithPages?.pages.find((page) => page.pageId === pageId)
  UNSAFE_invariant(pageToDelete, 'Page to delete not found')

  await prisma.$transaction(async (ts) => {
    await ts.page.delete({
      where: {
        pageId,
      },
    })

    await ts.form.update({
      where: { formId },
      data: {
        pagesTotal: { decrement: 1 },
        pages: {
          updateMany: {
            where: {
              pageNumber: {
                gt: pageToDelete.pageNumber,
              },
            },
            data: {
              pageNumber: {
                decrement: 1,
              },
            },
          },
        },
      },
    })
  })

  throw redirect(ROUTES.DASHBOARD_FORM(formId))
}
