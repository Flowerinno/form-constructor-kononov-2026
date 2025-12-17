import { redirect, useLoaderData } from 'react-router'
import { Spinner } from '~/components/app-ui/loading'
import { RenderPage } from '~/core/editor/render-page'
import { customResponse } from '~/lib/response'
import { ROUTES } from '~/routes'
import { getFormPage } from '~/services/form/form.service'
import type { Route } from './+types/form-page'

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { formId, pageId } = params
  const searchParams = new URL(request.url).searchParams
  const participantId = searchParams.get('participantId')
  const isPreview = searchParams.get('isPreview') === 'true'

  if (!isPreview && !participantId) {
    throw redirect(ROUTES.ENTRY_FORM(formId))
  }

  const page = await getFormPage(pageId, formId)

  return customResponse({ page, isPreview, participantId })
}

const FormPage = () => {
  const { data } = useLoaderData<typeof loader>()

  if (!data || !data.page) {
    return <Spinner />
  }
  console.log(data.page, 'Page Data in Form Page Route')
  return (
    <RenderPage
      page={data.page}
      pageId={data.page.pageId}
      formId={data.page.formId}
      theme={data.page.form.theme}
      pagesTotal={data.page.form.pagesTotal}
      isPreview={data.isPreview}
      participantId={data.participantId}
    />
  )
}

export default FormPage
