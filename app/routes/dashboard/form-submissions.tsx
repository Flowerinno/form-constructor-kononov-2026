import type { SortingState, Updater } from '@tanstack/react-table'
import { ArrowLeft, DownloadCloudIcon } from 'lucide-react'
import { Link, redirect, useLoaderData, useLocation, useSubmit } from 'react-router'
import { SubmissionsTable } from '~/components/app-ui/submissions-table'
import { Button } from '~/components/ui/button'
import { Heading } from '~/components/ui/heading'
import { customResponse } from '~/lib/response'
import { getPaginationData } from '~/lib/utils'
import { userContext } from '~/middleware/auth'
import { ROUTES } from '~/routes'
import { getFormSubmissions } from '~/services/form/form.service'
import { paginationSchema } from '~/validation/general'
import type { Route } from './+types/form-submissions'

export const loader = async ({ request, params, context }: Route.LoaderArgs) => {
  const userData = context.get(userContext)
  if (!userData) {
    throw redirect(ROUTES.LOGOUT)
  }

  const query = new URL(request.url).searchParams
  const queryParams = paginationSchema.parse(Object.fromEntries(query))

  const {
    formSubmissions,
    submissionsCount,
    pagination: paginationObject,
  } = await getFormSubmissions({
    formId: params.formId,
    queryParams,
  })

  return customResponse({
    formSubmissions,
    submissionsCount,
    pagination: paginationObject,
    formId: params.formId,
  })
}

const FormSubmissions = () => {
  const { data } = useLoaderData<typeof loader>()
  const submit = useSubmit()
  const location = useLocation()
  const { formSubmissions, submissionsCount, pagination, formId } = data

  const paginationData = getPaginationData(pagination)

  const onEmailSearch = (email: string) => {
    const searchParams = new URLSearchParams(location.search)
    const q = email.trim()
    if (q) {
      searchParams.set('q', q)
    } else {
      searchParams.delete('q')
    }
    submit(searchParams, { method: 'GET', navigate: true })
  }

  const onClear = () => {
    const searchParams = new URLSearchParams(location.search)
    searchParams.delete('q')
    searchParams.delete('page')
    searchParams.delete('sortBy')
    searchParams.delete('sortDirection')
    searchParams.delete('date')
    submit(searchParams, { method: 'GET', navigate: true })
  }

  const onSort = (sortingState: Updater<SortingState>) => {
    const searchParams = new URLSearchParams(location.search)
    // @ts-expect-error sortingState is defined here
    const data: SortingState = sortingState?.() || []
    searchParams.set('sortBy', data.at(0)?.id ?? 'createdAt')
    searchParams.set('sortDirection', data.at(0)?.desc ? 'desc' : 'asc')
    submit(searchParams, { method: 'GET', navigate: true })
  }

  const onDateChange = (date: Date | undefined) => {
    const searchParams = new URLSearchParams(location.search)
    if (date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const formattedDate = `${year}-${month}-${day}`
      searchParams.set('date', formattedDate)
    } else {
      searchParams.delete('date')
    }
    submit(searchParams, { method: 'GET', navigate: true })
  }

  return (
    <div>
      <Heading>
        <Link to={ROUTES.DASHBOARD_FORM(formId)} viewTransition>
          <Button variant={'ghost'} className='mb-4'>
            <ArrowLeft /> Form submissions ( {submissionsCount} )
          </Button>
        </Link>{' '}
        <Button size={'sm'}>
          <Link
            to={ROUTES.API_EXPORT_SUBMISSIONS(formId)}
            target='_blank'
            viewTransition
            className='flex gap-2 items-center'
          >
            Export submissions <DownloadCloudIcon />
          </Link>
        </Button>
      </Heading>
      <SubmissionsTable
        data={formSubmissions}
        onEmailSearch={onEmailSearch}
        onSort={onSort}
        onClear={onClear}
        onDateChange={onDateChange}
        pagination={paginationData}
      />
    </div>
  )
}

export default FormSubmissions
