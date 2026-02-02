import { Form, redirect, useActionData, useLoaderData } from 'react-router'
import { Button } from '~/components/ui/button'
import { Heading } from '~/components/ui/heading'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Paragraph } from '~/components/ui/paragraph'
import { customResponse, errorResponse, isRedirectResponse } from '~/lib/response'
import { commitSession, getSession, setSessionData } from '~/lib/session'
import { ROUTES } from '~/routes'
import { verifyOtp } from '~/services/auth/auth.service'
import { createUserSession, getUserSession } from '~/services/user/session.service'
import { signIn } from '~/services/user/user.service'
import { authSchema } from '~/validation/auth'
import { loginAuthSchema } from '~/validation/user'
import type { Route } from './+types/auth'
import { HTTP_STATUS_CODES } from '~/core/constant'

export const loader = async ({ request }: Route.LoaderArgs) => {
  const session = await getSession(request.headers.get('Cookie'))

  const query = new URL(request.url)
  const params = query.searchParams
  const { success, data } = loginAuthSchema.safeParse({
    otp: params.get('otp'),
    isNewUser: params.get('isNewUser') === 'true',
  })

  try {
    const maybeUserSession = await getUserSession(session.get('sessionId'))
    if (maybeUserSession) {
      throw redirect(ROUTES.DASHBOARD)
    }

    if (success && data.otp) {
      const otpData = await verifyOtp(data.otp)
      const verifiedSession = await createUserSession(otpData.userId, data.isNewUser)

      await setSessionData(session, verifiedSession)

      throw redirect(ROUTES.DASHBOARD, {
        status: HTTP_STATUS_CODES.FOUND,
        headers: {
          'Set-Cookie': await commitSession(session),
        },
      })
    }

    return customResponse({ message: 'Sign in required' })
  } catch (error) {
    isRedirectResponse(error)
    return errorResponse(error)
  }
}

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData()
  const { email } = authSchema.parse(Object.fromEntries(formData))
  await signIn(email)

  return customResponse({ message: 'Check your email for the login link!' })
}

export default function AuthWrapper() {
  const loaderData = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()

  return (
    <div className='flex min-h-full flex-col justify-center px-6 py-12 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-sm space-y-2'>
        <img
          src='https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500'
          alt='form-builder-logo'
          className='mx-auto h-10 w-auto'
        />
        <Heading className='text-center'>Sign in to your account</Heading>

        <Paragraph className='text-center'>
          {actionData?.data?.message ? actionData.data.message : null}
        </Paragraph>

        <Paragraph className='text-center'>
          {loaderData.error ? loaderData.error.message : null}
        </Paragraph>
      </div>

      <div className='mt-10 sm:mx-auto sm:w-full sm:max-w-sm'>
        <Form method='POST' className='space-y-6'>
          <div>
            <Label htmlFor='email'>Email address</Label>
            <div className='mt-2'>
              <Input
                id='email'
                type='email'
                name='email'
                required
                minLength={8}
                autoComplete='email'
                className='w-full'
              />
            </div>
          </div>
          <div>
            <Button type='submit' variant={'default'} className='w-full'>
              Let&apos;s create
            </Button>
          </div>
        </Form>
      </div>
    </div>
  )
}
