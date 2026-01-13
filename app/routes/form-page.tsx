import { redirect, useLoaderData } from 'react-router'
import { Spinner } from '~/components/app-ui/loading'
import { REDIS_KEYS } from '~/core/constant'
import { RenderPage } from '~/core/editor/render-page'
import { setRedisEntry } from '~/lib/redis'
import { customResponse } from '~/lib/response'
import { decodeExistingPageAnswers } from '~/lib/util.server'
import { ROUTES } from '~/routes'
import { getFormPage } from '~/services/form/form.service'
import type { Route } from './+types/form-page'

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { formId, pageNumber } = params
  const searchParams = new URL(request.url).searchParams
  const participantId = searchParams.get('participantId')
  const isPreview = searchParams.get('isPreview') === 'true'

  if (!isPreview && !participantId) {
    throw redirect(ROUTES.ENTRY_FORM(formId))
  }

  const page = await getFormPage(Number(pageNumber), formId, isPreview, participantId)
  const decodedPageAnswers = await decodeExistingPageAnswers(page)

  await setRedisEntry(
    REDIS_KEYS.FORM_PAGE_BY_NUMBER(formId, Number(pageNumber)),
    page,
    24 * 60 * 60,
  )

  return customResponse({ page, isPreview, participantId, decodedPageAnswers })
}

const FormPage = () => {
  const { data } = useLoaderData<typeof loader>()

  if (!data || !data.page) {
    return <Spinner />
  }

  return (
    <RenderPage
      page={data.page}
      pageId={data.page.pageId}
      formId={data.page.formId}
      theme={data.page.form.theme}
      pagesTotal={data.page.form.pagesTotal}
      isPreview={data.isPreview}
      participantId={data.participantId}
      decodedPageAnswers={data.decodedPageAnswers}
    />
  )
}

export default FormPage
