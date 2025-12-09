import { PlusIcon } from 'lucide-react'
import { Form, Link, useLoaderData } from 'react-router'
import { toast } from 'sonner'
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
import { userContext } from '~/middleware/auth'
import { ROUTES } from '~/routes'
import { getUserForms } from '~/services/form/form.service'
import type { Route } from './+types'

export const loader = async ({ context }: Route.LoaderArgs) => {
  const userData = context.get(userContext)
  if (!userData) {
    throw new Response('Unauthorized', { status: 401 })
  }
  const forms = await getUserForms(userData.userId)
  return customResponse({ forms })
}
//TODO: possibly put submissions here later
const DashboardIndex = () => {
  const loaderData = useLoaderData<typeof loader>()
  return (
    <div>
      <Heading className='flex gap-2 items-center'>
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
      </Heading>
      <div className='mt-8 flex flex-col gap-4'></div>
      {loaderData.data.forms.length === 0 && (
        <p className='text-muted-foreground'>You have no forms yet.</p>
      )}
      <div className='grid grid-cols-2 gap-4'>
        {loaderData.data.forms.map((form) => (
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
    </div>
  )
}

export default DashboardIndex
