import { ArrowLeft, CheckIcon, LinkIcon } from 'lucide-react'
import { Suspense } from 'react'
import { Await, Form, Link, UNSAFE_invariant, useLoaderData, useParams } from 'react-router'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { Spinner } from '~/core/components/loading'
import { FormEditor } from '~/core/editor/form-editor'
import { customResponse } from '~/lib/response'
import { userContext } from '~/middleware/auth'
import { ROUTES } from '~/routes'
import { getFormPage } from '~/services/form/form.service'
import type { Route } from './+types/form-page'

export const loader = async ({ params, context }: Route.LoaderArgs) => {
  const { formId, pageId } = params
  const userData = context.get(userContext)
  UNSAFE_invariant(userData, 'userData is required')

  const page = await getFormPage(pageId, formId)

  return customResponse({ page })
}

const FormEdit = () => {
  const loaderData = useLoaderData<typeof loader>()
  const { formId = '', pageId = '' } = useParams<{ formId: string; pageId: string }>()
  const page = loaderData.data.page

  return (
    <div>
      <Suspense fallback={<Spinner />}>
        <Await resolve={page}>
          <>
            <Link to={ROUTES.DASHBOARD_FORM(formId)} viewTransition>
              <Button variant={'ghost'} className='mb-4'>
                <ArrowLeft />
              </Button>
            </Link>
            {page && (
              <>
                <div className='w-full flex items-center justify-between gap-2'>
                  <Form
                    method='POST'
                    navigate={false}
                    onSubmitCapture={() => toast.success('Page info updated')}
                    action={ROUTES.API_FORM_PAGE_UPDATE}
                    className='max-w-[400px] w-full mb-2 flex flex-col items-center sm:flex-row sm:items-start gap-4'
                  >
                    <input type='hidden' name='formId' value={formId} />
                    <input type='hidden' name='pageId' value={pageId} />

                    <Input
                      id='title'
                      name='title'
                      type='text'
                      className='text-2xl w-full'
                      defaultValue={page?.title ? page.title : `Page ${page.pageNumber}`}
                    />

                    <Button type='submit' variant={'outline'}>
                      <CheckIcon />
                    </Button>
                  </Form>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        target='_blank'
                        to={
                          'window' in globalThis
                            ? window.location.origin +
                              ROUTES.FORM_PAGE(formId, pageId) +
                              '?isPreview=true'
                            : ''
                        }
                      >
                        <LinkIcon />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Preview Page</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip></Tooltip>
                </div>
                <FormEditor
                  page={page}
                  pagesTotal={page.form.pagesTotal}
                  formId={formId}
                  pageId={pageId}
                  isPreview={true}
                  theme={page.form.theme}
                />
              </>
            )}
          </>
        </Await>
      </Suspense>
    </div>
  )
}

export default FormEdit
