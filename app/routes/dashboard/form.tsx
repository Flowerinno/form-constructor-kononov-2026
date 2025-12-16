import { CopyIcon, PlusIcon, TrashIcon, ZapIcon, ZapOffIcon } from 'lucide-react'
import { Suspense } from 'react'
import {
  Await,
  data,
  Link,
  Form as RRForm,
  UNSAFE_invariant,
  useLoaderData,
  useSubmit,
} from 'react-router'
import { toast } from 'sonner'
import { Spinner } from '~/components/app-ui/loading'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { Heading } from '~/components/ui/heading'
import { Paragraph } from '~/components/ui/paragraph'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { RenderPage } from '~/core/editor/render-page'
import { customResponse } from '~/lib/response'
import { cn } from '~/lib/utils'
import { userContext } from '~/middleware/auth'
import { ROUTES } from '~/routes'
import { createFormPage, getFormById } from '~/services/form/form.service'
import type { Route } from './+types/form'

export const loader = async ({ params, context }: Route.LoaderArgs) => {
  const formId = params.formId
  const userData = context.get(userContext)
  UNSAFE_invariant(userData, 'userData is required')

  const form = await getFormById(formId)
  return customResponse({ form })
}

export const action = async ({ params, context }: Route.LoaderArgs) => {
  const userData = context.get(userContext)
  UNSAFE_invariant(userData, 'userData is required')
  await createFormPage(params.formId)

  return data(customResponse({ message: 'Page added successfully' }), { status: 201 })
}

export default function Form() {
  const { data } = useLoaderData<typeof loader>()
  const submit = useSubmit()

  const currentForm = data.form
  const isNoPages = currentForm?.pages.length === 0

  if (!currentForm) {
    return <Spinner />
  }

  const onThemeChange = (theme: string, formId: string) => {
    const formData = new FormData()
    formData.append('formId', formId)
    formData.append('theme', theme)

    submit(formData, { method: 'POST', action: ROUTES.API_FORM_THEME_UPDATE, navigate: false })
    toast.success('Form theme updated to ' + theme)
  }

  const onFormDelete = () => {
    const agree = confirm(
      'Are you sure you want to delete this form? This action cannot be undone.',
    )
    const formData = new FormData()
    formData.append('formId', currentForm.formId)

    if (agree) {
      submit(formData, {
        method: 'DELETE',
        action: ROUTES.API_FORM_DELETE,
        navigate: true,
        viewTransition: true,
      })
      toast.success('Form deleted successfully')
    }
  }

  const onToggleAllowResubmissions = () => {
    const formData = new FormData()
    formData.append('formId', currentForm.formId)

    submit(formData, {
      method: 'POST',
      action: ROUTES.API_FORM_TOGGLE_ALLOW_RESUBMISSIONS,
      navigate: false,
    })
    toast.success('Form resubmissions toggled')
  }

  const isFormEmpty =
    currentForm.pages.length === 0 || currentForm.pages.some((page) => !page.pageFields)

  const togglePublish = () => {
    const confirmMessage = currentForm.publishedAt
      ? 'Are you sure you want to unpublish this form? It will no longer be accessible to participants.'
      : 'Are you sure you want to publish this form? It will be accessible to participants.'

    const approved = confirm(confirmMessage)
    const formData = new FormData()
    formData.append('formId', currentForm.formId)

    if (isFormEmpty) {
      toast.error(
        'Cannot publish a form with incomplete pages. Please complete all pages before publishing.',
      )
      return
    }

    if (approved) {
      submit(formData, {
        method: 'POST',
        action: ROUTES.API_FORM_TOGGLE_PUBLISH,
        navigate: false,
      })
      toast.success(`Form ${currentForm.publishedAt ? 'unpublished' : 'published'} successfully`)
    }
  }

  return (
    <div>
      <Heading className='flex flex-wrap gap-2 items-center'>
        {currentForm.title}{' '}
        <Tooltip>
          <TooltipTrigger asChild>
            <RRForm method='POST' navigate={false}>
              <Button size={'icon-sm'} className='mt-1'>
                <PlusIcon />
              </Button>
            </RRForm>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add page</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(
                  window.location.origin + ROUTES.ENTRY_FORM(currentForm.formId),
                )
                toast.success('Link copied to clipboard')
              }}
              size={'icon-sm'}
              className='mt-1'
            >
              <CopyIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Copy Link</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onFormDelete} size={'icon-sm'} className='mt-1'>
              <TrashIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete form</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              disabled={isFormEmpty}
              onClick={togglePublish}
              size={'icon-sm'}
              className='mt-1'
            >
              {currentForm.publishedAt ? (
                <ZapIcon className='text-green-400' />
              ) : (
                <ZapOffIcon className='text-red-400' />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{currentForm.publishedAt ? 'Unpublish form' : 'Publish form'}</p>
          </TooltipContent>
        </Tooltip>
        <Select
          name='theme'
          defaultValue={currentForm.theme}
          onValueChange={(v) => onThemeChange(v, currentForm.formId)}
        >
          <SelectTrigger size='sm' className='w-[180px] cursor-pointer mt-1'>
            <SelectValue placeholder={`Theme: ${currentForm.theme}`} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Theme</SelectLabel>
              <SelectItem className='cursor-pointer' value='DARK'>
                Dark
              </SelectItem>
              <SelectItem className='cursor-pointer' value='LIGHT'>
                Light
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Tooltip>
          <TooltipTrigger asChild>
            <Checkbox
              onCheckedChange={onToggleAllowResubmissions}
              defaultChecked={currentForm.allowResubmission}
            />
          </TooltipTrigger>
          <TooltipContent>
            <p>Allow resubmissions</p>
          </TooltipContent>
        </Tooltip>
      </Heading>
      {isNoPages && (
        <Paragraph className='mt-4'>No pages found. Please add pages to your form.</Paragraph>
      )}
      <Suspense fallback={<Spinner />}>
        <Await resolve={currentForm}>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12'>
            {currentForm &&
              currentForm.pages.map((page) => (
                <Link
                  viewTransition
                  to={ROUTES.DASHBOARD_FORM_PAGE(currentForm.formId, page.pageId)}
                  key={page.id}
                  className={cn(
                    'mb-8 border relative min-h-[150px] w-full min-w-[350px]',
                    !page.pageFields && 'bg-muted',
                  )}
                >
                  <Heading className='absolute top-0 right-0 -translate-y-8 translate-x-2 text-sm font-bold uppercase px-2 py-1 truncate max-w-[150px]'>
                    {page?.title ? page.title : `Page ${page.pageNumber}`}
                  </Heading>
                  {page.pageFields && (
                    <RenderPage
                      formId={currentForm.formId}
                      pageId={page.pageId}
                      page={page}
                      pagesTotal={currentForm.pagesTotal}
                      theme={currentForm.theme}
                      isPreview={true}
                      participantId={null}
                    />
                  )}
                </Link>
              ))}
          </div>
        </Await>
      </Suspense>
    </div>
  )
}
