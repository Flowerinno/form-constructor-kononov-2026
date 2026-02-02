import { data, redirect } from 'react-router'
import { HTTP_STATUS_CODES, REDIS_KEYS } from '~/core/constant'
import { prisma } from '~/db'
import { deleteRedisEntry } from '~/lib/redis'
import { customResponse } from '~/lib/response'
import { authMiddleware, userContext } from '~/middleware/auth'
import { ROUTES } from '~/routes'
import { updatePageGeneral } from '~/validation/form'
import type { Route } from '../+types/update'

export const middleware: Route.MiddlewareFunction[] = [authMiddleware]

export const action = async ({ request, context }: Route.ActionArgs) => {
  const userData = context.get(userContext)

  if (!userData) {
    throw redirect(ROUTES.LOGOUT)
  }

  const formData = await request.formData()
  const validated = await updatePageGeneral.parseAsync(Object.fromEntries(formData))

  const { formId, pageId, title } = validated

  const page = await prisma.page.update({
    where: {
      formId,
      pageId,
    },
    data: {
      title,
    },
    select: {
      id: true,
      pageNumber: true,
    },
  })

  await deleteRedisEntry(REDIS_KEYS.FORM_PAGE_BY_NUMBER(formId, page.pageNumber))

  return data(customResponse({ message: 'Form updated successfully' }), {
    status: HTTP_STATUS_CODES.CREATED,
  })
}
