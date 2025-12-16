import { Link, useLocation } from 'react-router'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from '~/components/ui/pagination'
import { cn } from '~/lib/utils'

export type AppPaginationProps = {
  pageNumbers: number[]
  hasPrevious: boolean
  hasNext: boolean
  startPage: number
  endPage: number
  totalPages: number
  currentPage: number
  generatePageLink: (page: number, location: Location<any>) => string
}

const AppPagination = ({
  totalPages,
  pageNumbers,
  currentPage,
  startPage,
  endPage,
  generatePageLink,
}: AppPaginationProps) => {
  const location = useLocation()

  if (totalPages <= 1) {
    return null
  }

  return (
    <Pagination className='mt-8'>
      <PaginationContent>
        <PaginationItem>
          <Link
            viewTransition
            to={currentPage > 1 ? generatePageLink(currentPage - 1, location) : '#'}
            className={cn(currentPage === 1 && 'opacity-70 cursor-not-allowed')}
            onClick={(e) => currentPage === 1 && e.preventDefault()}
          >
            Previous
          </Link>
        </PaginationItem>

        {startPage > 1 && (
          <>
            <PaginationItem>
              <Link to={generatePageLink(1, location)} viewTransition>
                1
              </Link>
            </PaginationItem>
            {startPage > 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
          </>
        )}

        {pageNumbers.map((pageNumber) => (
          <PaginationItem key={pageNumber}>
            <Link
              viewTransition
              to={generatePageLink(pageNumber, location)}
              aria-current={pageNumber === currentPage ? 'page' : undefined}
              className={cn(
                pageNumber === currentPage ? 'font-bold underline' : 'opacity-70',
                'p-2',
              )}
            >
              {pageNumber}
            </Link>
          </PaginationItem>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            <PaginationItem>
              <Link to={generatePageLink(totalPages, location)} viewTransition>
                {totalPages}
              </Link>
            </PaginationItem>
          </>
        )}

        <PaginationItem>
          <Link
            viewTransition
            className={cn(currentPage === totalPages && 'opacity-70 cursor-not-allowed')}
            onClick={(e) => currentPage === totalPages && e.preventDefault()}
            to={currentPage < totalPages ? generatePageLink(currentPage + 1, location) : '#'}
          >
            Next
          </Link>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

export default AppPagination
