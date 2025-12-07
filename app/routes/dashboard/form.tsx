import { UNSAFE_invariant, useLoaderData } from 'react-router'
import { Heading } from '~/components/ui/heading'
import { customResponse } from '~/lib/response'
import { userContext } from '~/middleware/auth'
import { getFormById } from '~/services/form/form.service'
import type { Route } from './+types/form'

export const loader = async ({ params, context }: Route.LoaderArgs) => {
  const formId = params.formId
  const userData = context.get(userContext)
  UNSAFE_invariant(userData, 'userData is required')

  const form = await getFormById(formId, userData.userId)

  return customResponse({ form })
}

const Form = () => {
  const loaderData = useLoaderData<typeof loader>()
  return (
    <div>
      <Heading>{loaderData.data.form?.title}</Heading>
    </div>
  )
}

export default Form
