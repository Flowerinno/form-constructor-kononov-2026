import { data, Form, redirect, useActionData, useLoaderData } from 'react-router'
import { customResponse, errorResponse, isRedirectResponse } from '~/lib/response'
import { commitSession, getSession, setSessionData } from '~/lib/session'
import { ROUTES } from '~/routes'
import { verifyOtp } from '~/services/auth/auth.service'
import { createUserSession } from '~/services/user/session.service'
import { signIn } from '~/services/user/user.service'
import { authSchema } from '~/validation/auth'
import type { Route } from './+types/auth'

export const loader = async ({ request }: Route.LoaderArgs) => {
  const token = new URL(request.url).searchParams.get('otp')
  const session = await getSession(request.headers.get('Cookie'))
  
  try {
    if (token) {
      const otpData = await verifyOtp(token)
      const verifiedSession = await createUserSession(otpData.userId)

      setSessionData(session, verifiedSession)

      throw redirect(ROUTES.DASHBOARD, {
        status: 302,
        headers: {
          'Set-Cookie': await commitSession(session),
        },
      })
    }

    return data(customResponse({ message: 'Sign in required' }))
  } catch (error) {
    isRedirectResponse(error)
    return data(errorResponse(error))
  }
}

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData()
  const { email } = authSchema.parse(Object.fromEntries(formData))
  await signIn(email)

  return customResponse({ message: 'Check your email for the login link!' })
}

const AuthWrapper = () => {
  const loaderData = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()

  return (
    <div className='flex min-h-full flex-col justify-center px-6 py-12 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-sm'>
        <img
          src='https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500'
          alt='Your Company'
          className='mx-auto h-10 w-auto'
        />
        <h2 className='mt-10 text-center text-2xl/9 font-bold tracking-tight text-white'>
          Sign in to your account
        </h2>

        <p className='mt-4 text-center text-sm text-green-400'>
          {actionData?.data?.message ? actionData.data.message : null}
        </p>

        <p className='mt-4 text-center text-sm text-red-400'>
          {loaderData.error ? loaderData.error.message : null}
        </p>
      </div>

      <div className='mt-10 sm:mx-auto sm:w-full sm:max-w-sm'>
        <Form method='POST' className='space-y-6'>
          <div>
            <label htmlFor='email' className='block text-sm/6 font-medium text-gray-100'>
              Email address
            </label>
            <div className='mt-2'>
              <input
                id='email'
                type='email'
                name='email'
                required
                minLength={8}
                autoComplete='email'
                className='block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6'
              />
            </div>
          </div>
          <div>
            <button
              type='submit'
              className='flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500'
            >
              Let's create
            </button>
          </div>
        </Form>
      </div>
    </div>
  )
}

export default AuthWrapper
