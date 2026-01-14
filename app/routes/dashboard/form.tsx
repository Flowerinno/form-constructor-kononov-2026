import {
  ArrowLeft,
  CopyIcon,
  CopyPlusIcon,
  LucideRefreshCcw,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  ZapIcon,
  ZapOffIcon,
} from 'lucide-react'
import { Suspense } from 'react'
import {
  Await,
  data,
  Link,
  Form as RRForm,
  UNSAFE_invariant,
  useLoaderData,
  useRevalidator,
  useSearchParams,
  useSubmit,
} from 'react-router'
import { toast } from 'sonner'
import { Spinner } from '~/components/app-ui/loading'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import { Heading } from '~/components/ui/heading'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
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
import { prisma } from '~/db'
import { customResponse } from '~/lib/response'
import { cn } from '~/lib/utils'
import { userContext } from '~/middleware/auth'
import { ROUTES } from '~/routes'
import {
  calculateFormConversionRate,
  countFormSubmissions,
  createFormPage,
  getFormById,
} from '~/services/form/form.service'
import type { Route } from './+types/form'

export const loader = async ({ params, context }: Route.LoaderArgs) => {
  const userData = context.get(userContext)
  UNSAFE_invariant(userData, 'userData is required')

  const formId = params.formId
  const form = await getFormById(formId)

  const notFinishedEngagements = await prisma.pageAnswer.count({
    where: {
      page: {
        pageNumber: 1,
        formId,
      },
      participant: {
        completedAt: null,
      },
    },
  })
  const [formSubmissionsCount, conversion] = await Promise.all([
    countFormSubmissions(formId),
    calculateFormConversionRate(formId),
  ])

  return customResponse({ form, formSubmissionsCount, notFinishedEngagements, conversion })
}

export const action = async ({ params, context }: Route.LoaderArgs) => {
  const userData = context.get(userContext)
  UNSAFE_invariant(userData, 'userData is required')

  await createFormPage(params.formId)

  return data(customResponse({ message: 'Page added successfully' }), { status: 201 })
}

export default function Form() {
  const { data } = useLoaderData<typeof loader>()
  const revalidator = useRevalidator()
  const [searchParams] = useSearchParams()
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
        <Link
          to={{
            pathname: ROUTES.DASHBOARD,
            search: searchParams.toString(),
          }}
          viewTransition
        >
          <Button variant={'ghost'}>
            <ArrowLeft /> Forms / <strong>{currentForm.title}</strong>
          </Button>
        </Link>{' '}
        <Tooltip>
          <TooltipTrigger asChild>
            <RRForm method='POST' navigate={false}>
              <Button disabled={!!currentForm.publishedAt} size={'icon-sm'} className='mt-1'>
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
              disabled={!currentForm.publishedAt}
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
            <Button
              disabled={!!currentForm.publishedAt}
              onClick={onFormDelete}
              size={'icon-sm'}
              className='mt-1'
            >
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
        <Tooltip>
          <TooltipTrigger>
            <Dialog>
              <DialogTrigger asChild>
                <Button size={'icon-sm'} className='mt-1'>
                  <PencilIcon />
                </Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-[425px]'>
                <RRForm
                  method='POST'
                  action={ROUTES.API_FORM_FINAL_PAGE_UPDATE}
                  navigate={false}
                  onSubmitCapture={() => toast.success('Thank you page updated')}
                  className='flex flex-col gap-4'
                >
                  <DialogHeader>
                    <DialogTitle>Edit final page</DialogTitle>
                    <DialogDescription>
                      Make changes to your thank you page here. Click save when you&apos;re done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className='grid gap-4'>
                    <div className='grid gap-3'>
                      <input type='hidden' name='formId' value={currentForm.formId} />
                      <Label htmlFor='title'>Title</Label>
                      <Input
                        id='title'
                        name='finalTitle'
                        minLength={5}
                        maxLength={100}
                        defaultValue={currentForm.finalTitle ?? ''}
                      />
                    </div>
                    <div className='grid gap-3'>
                      <Label htmlFor='description'>Description</Label>
                      <Input
                        id='description'
                        name='finalDescription'
                        defaultValue={currentForm.finalDescription ?? ''}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant='outline'>Cancel</Button>
                    </DialogClose>
                    <Button type='submit'>Save changes</Button>
                  </DialogFooter>
                </RRForm>
              </DialogContent>
            </Dialog>
          </TooltipTrigger>
          <TooltipContent>
            <p>Edit Thank You Page</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger>
            <Dialog>
              <DialogTrigger asChild>
                <Button size={'icon-sm'} className='mt-1'>
                  <CopyPlusIcon />
                </Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-[425px]'>
                <RRForm
                  method='POST'
                  action={ROUTES.API_FORM_DUPLICATE}
                  navigate={false}
                  onSubmitCapture={() => toast.success('Form duplicated successfully')}
                  className='flex flex-col gap-4'
                >
                  <DialogHeader>
                    <DialogTitle>Duplicate form</DialogTitle>
                  </DialogHeader>
                  <div className='grid gap-4'>
                    <div className='grid gap-3'>
                      <input type='hidden' name='formId' value={currentForm.formId} />
                      <Label htmlFor='title'>Form Title*</Label>
                      <Input
                        id='title'
                        name='title'
                        minLength={5}
                        maxLength={100}
                        required
                        defaultValue={''}
                      />
                    </div>
                    <div className='grid gap-3'>
                      <Label htmlFor='description'>Form Description</Label>
                      <Input id='description' name='description' defaultValue={''} />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant='outline'>Cancel</Button>
                    </DialogClose>
                    <Button type='submit'>Confirm</Button>
                  </DialogFooter>
                </RRForm>
              </DialogContent>
            </Dialog>
          </TooltipTrigger>
          <TooltipContent>
            <p>Duplicate form</p>
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
      </Heading>

      <div className='mt-4 flex flex-wrap gap-2'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link to={ROUTES.DASHBOARD_FORM_SUBMISSIONS(currentForm.formId)}>
              <Button variant='outline'>Submissions: {data.formSubmissionsCount ?? 0}</Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>Go to submissions</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant='outline'>Engagements: {data.notFinishedEngagements ?? 0}</Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Engaged but not finished</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant='outline'>Conversion: {data.conversion?.toFixed(2) ?? 0}%</Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              (Total Submissions / Total Unique Participants) * 100 ={' '}
              {data.conversion?.toFixed(2) ?? 0}%
            </p>
          </TooltipContent>
        </Tooltip>
        <Button variant='outline' onClick={() => revalidator.revalidate()}>
          <LucideRefreshCcw />
        </Button>
      </div>

      {isNoPages && (
        <Paragraph className='mt-4'>No pages found. Please add pages to your form.</Paragraph>
      )}
      <Suspense fallback={<Spinner />}>
        <Await resolve={currentForm}>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 mt-12'>
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
