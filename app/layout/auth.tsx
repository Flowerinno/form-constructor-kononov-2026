import { UNSAFE_invariant as invariant, Outlet, redirect, useLoaderData } from 'react-router'
import { AppSidebar } from '~/components/app-ui'
import { SidebarProvider, SidebarTrigger } from '~/components/ui/sidebar'
import { logger } from '~/lib/logger'
import { destroySession, getSession } from '~/lib/session'
import { authMiddleware, userContext } from '~/middleware/auth'
import { ROUTES } from '~/routes'
import type { Route } from '../routes/dashboard/+types'

export const middleware: Route.MiddlewareFunction[] = [authMiddleware]

export const loader = async ({ request, context }: Route.LoaderArgs) => {
  const reqSession = await getSession(request.headers.get('Cookie'))
  try {
    const user = context.get(userContext)
    invariant(user, 'User context is not set in Auth layout loader')

    return {
      userData: {
        name: user.name,
        email: user.email,
        userId: user.userId,
      },
    }
  } catch (error) {
    logger.info(error, 'Auth layout loader - invalid session')
    throw redirect(ROUTES.AUTH, {
      headers: {
        'Set-Cookie': await destroySession(reqSession),
      },
    })
  }
}

const AuthLayout = () => {
  const data = useLoaderData<typeof loader>()
  return (
    <div id='main-layout' className='flex min-h-full min-w-full relative'>
      <SidebarProvider defaultOpen={false}>
        <AppSidebar />
        <main className='flex flex-col min-h-full w-full'>
          <SidebarTrigger className='mt-2 ml-2' />
          <section className='p-4'>
            <Outlet context={data.userData} />
          </section>
        </main>
      </SidebarProvider>
    </div>
  )
}

export default AuthLayout
