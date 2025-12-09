import { useLoaderData } from 'react-router'
import { Spinner } from '~/core/components/loading'
import { RenderPage } from '~/core/editor/render-page'
import { customResponse } from '~/lib/response'
import { getFormPage } from '~/services/form/form.service'
import type { Route } from './+types/form-page'

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { formId, pageId } = params
  const isPreview = new URL(request.url).searchParams.get('isPreview') === 'true'
  const page = await getFormPage(pageId, formId)

  return customResponse({ page, isPreview })
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
    />
  )
}

export default FormPage
