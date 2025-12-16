import { PlusIcon } from 'lucide-react'
import type { FormEvent } from 'react'
import { Form, Link, redirect, useLoaderData, useSubmit } from 'react-router'
import { toast } from 'sonner'
import AppPagination from '~/components/app-ui/app-pagination'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import { Heading } from '~/components/ui/heading'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Paragraph } from '~/components/ui/paragraph'
import { customResponse } from '~/lib/response'
import { getPaginationData } from '~/lib/utils'
import { userContext } from '~/middleware/auth'
import { ROUTES } from '~/routes'
import { getUserForms } from '~/services/form/form.service'
import { paginationSchema } from '~/validation/general'
import type { Route } from './+types'

export const loader = async ({ request, context }: Route.LoaderArgs) => {
  const query = new URL(request.url).searchParams
  const params = paginationSchema.parse(Object.fromEntries(query))

  const userData = context.get(userContext)
  if (!userData) {
    throw redirect(ROUTES.LOGOUT)
  }

  // const randomForms = Array.from({ length: 100 }).map((_, i) => ({
  //   title: `Form ${i + 1}`,
  //   description: `This is the description for form ${i + 1}.`,
  // }))

  // await prisma.form.createMany({
  //   data: randomForms.map((form) => ({
  //     title: form.title,
  //     description: form.description,
  //     creatorId: userData.userId,
  //   })),
  // })

  const paginatedUserForms = await getUserForms(userData.userId, params.q, {
    page: params.page,
    take: 12,
  })
  return customResponse({
    forms: paginatedUserForms.forms,
    pagination: paginatedUserForms.pagination,
  })
}

const DashboardIndex = () => {
  const submit = useSubmit()
  const { data } = useLoaderData<typeof loader>()

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const q = formData.get('q')?.toString() || ''
    submit(q ? { q } : null, { method: 'GET' })
  }

  const paginationData = getPaginationData(data?.pagination)

  return (
    <div>
      <Heading className='flex flex-wrap gap-2 items-center'>
        My Forms
        <Dialog>
          <DialogTrigger asChild>
            <Button size={'icon-sm'} className='mt-1'>
              <PlusIcon />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create new form</DialogTitle>
              <Form
                navigate={false}
                onSubmitCapture={() => toast('Form created')}
                action={ROUTES.API_FORM_CREATE}
                method='POST'
                className='flex flex-col gap-8'
              >
                <div>
                  <Label htmlFor='title'>Title*</Label>
                  <Input id='title' name='title' />
                </div>
                <div>
                  <Label htmlFor='description'>Description</Label>
                  <Input id='description' name='description' />
                </div>
                <DialogClose asChild>
                  <Button type='submit'>Create</Button>
                </DialogClose>
              </Form>
            </DialogHeader>
          </DialogContent>
        </Dialog>
        <Form onSubmit={handleSearch} className='max-w-fit'>
          <Input
            type='search'
            name='q'
            placeholder='Search forms...'
            className='max-w-[400px] max-h-8'
          />
        </Form>
      </Heading>
      <div className='mt-8 flex flex-col gap-4'></div>
      {data && data.forms.length === 0 && (
        <p className='text-muted-foreground'>You have no forms yet.</p>
      )}
      <div className='grid grid-cols-2 gap-4'>
        {data &&
          data.forms.map((form) => (
            <Link
              viewTransition
              to={ROUTES.DASHBOARD_FORM(form.formId)}
              key={form.formId}
              className='p-4 border rounded-md'
            >
              <Paragraph className='font-bold mb-2'>{form.title}</Paragraph>
              <Paragraph className='text-sm text-muted-foreground truncate max-w-[400px]'>
                {form.description}
              </Paragraph>
            </Link>
          ))}
      </div>
      <br />
      {paginationData && <AppPagination key={paginationData.currentPage} {...paginationData} />}
    </div>
  )
}

export default DashboardIndex
