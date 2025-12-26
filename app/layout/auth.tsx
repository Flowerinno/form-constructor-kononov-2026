import { UNSAFE_invariant as invariant, Outlet, useLoaderData } from 'react-router'
import { AppSidebar } from '~/components/app-ui'
import { SidebarProvider, SidebarTrigger } from '~/components/ui/sidebar'
import { authMiddleware, userContext } from '~/middleware/auth'
import type { Route } from '../routes/dashboard/+types'

export const middleware: Route.MiddlewareFunction[] = [authMiddleware]

export const loader = async ({ context }: Route.LoaderArgs) => {
  const user = context.get(userContext)
  invariant(user, 'User context is not set in Auth layout loader')

  return {
    userData: {
      name: user.name,
      email: user.email,
      userId: user.userId,
    },
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
