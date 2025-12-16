import React from 'react'
import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from 'react-router'

import { SunIcon } from 'lucide-react'
import { useState } from 'react'
import type { Route } from './+types/root'
import './app.css'
import { Button } from './components/ui/button'
import { Toaster } from './components/ui/sonner'
import { ROUTES } from './routes'
import { cn } from './lib/utils'

export const links: Route.LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState('dark')
  const location = useLocation()
  const isToggleVisible = location.pathname.includes(ROUTES.DASHBOARD)
  return (
    <html lang='en' className={cn(theme, 'h-full min-h-full')}>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <Meta />
        <Links />
      </head>
      <body className='relative h-full'>
        {isToggleVisible && (
          <SunIcon
            className='absolute z-10 top-4 right-4 cursor-pointer dark:text-white hover:text-purple-400 transition-all duration-150'
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          />
        )}
        {children}
        <Toaster position='top-right' duration={3000} />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!'
  let details = 'An unexpected error occurred.'
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? 'Page not found' : 'Error'
    details =
      error.status === 404 ? 'The requested page could not be found.' : error.statusText || details
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <main className='pt-16 p-4 container mx-auto'>
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className='w-full p-4 overflow-x-auto'>
          <code>{stack}</code>
        </pre>
      )}
      <Link viewTransition to={ROUTES.AUTH}>
        <Button>Go home</Button>
      </Link>
    </main>
  )
}
