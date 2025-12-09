import { LoaderIcon } from 'lucide-react'
import React from 'react'
import { cn } from '~/lib/utils'

function Spinner({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <div className='w-full h-full flex items-center justify-center'>
      <LoaderIcon
        role='status'
        aria-label='Loading'
        className={cn('h-12 w-12 animate-spin', className)}
        {...props}
      />
    </div>
  )
}

export { Spinner }
