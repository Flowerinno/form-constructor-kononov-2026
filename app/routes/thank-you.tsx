import { useLoaderData } from 'react-router'
import { Spinner } from '~/components/app-ui/loading'
import { cn } from '~/lib/utils'
import { getThankYouPageData } from '~/services/form/form.service'
import type { Route } from './+types/thank-you'

export const loader = async ({ params }: Route.LoaderArgs) => {
  const data = await getThankYouPageData(params.submissionId)
  return { data }
}

const ThankYou = () => {
  const tyData = useLoaderData<typeof loader>()

  if (!tyData.data) {
    return <Spinner />
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center min-h-screen p-6',
        tyData.data.form.theme === 'DARK' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-black',
      )}
    >
      <h1 className='text-4xl font-bold mb-4 text-center'>
        {tyData.data.form.finalTitle || 'Thank you for submitting the form'}
      </h1>
      <p className='text-lg text-center'>{tyData.data.form.finalDescription}</p>
    </div>
  )
}

export default ThankYou
