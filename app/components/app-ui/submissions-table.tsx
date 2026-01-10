import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type Updater,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { FormSubmission } from 'generated/prisma/client'
import { ArrowUpDown, ChevronDown, MoreHorizontal, Trash2Icon } from 'lucide-react'
import * as React from 'react'

import { Link, useSearchParams } from 'react-router'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Input } from '~/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { cn } from '~/lib/utils'
import { ROUTES } from '~/routes'
import type { AppPaginationProps } from './app-pagination'
import { DatePicker } from './date-picker'

export type Submission = FormSubmission & {
  participant: {
    email: string
  }
}

export const columns: ColumnDef<Submission>[] = [
  {
    accessorKey: 'submissionId',
    header: 'Submission ID',
    cell: ({ row }) => <div className='font-mono text-sm'>{row.getValue('submissionId')}</div>,
  },
  {
    accessorKey: 'participant',
    accessorFn: (row) => row.participant.email,
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          className={cn(column.getIsSorted() ? 'bg-muted text-black' : '')}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Participant Email
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      )
    },
    cell: ({ row }) => (
      <Link
        viewTransition
        to={ROUTES.DASHBOARD_FORM_SUBMISSION(row.getValue('formId'), row.getValue('submissionId'))}
        className='lowercase'
      >
        {row.getValue('participant')}
      </Link>
    ),
  },
  {
    accessorKey: 'formId',
    header: 'Form ID',
    cell: ({ row }) => (
      <div className='font-mono text-xs text-muted-foreground'>{row.getValue('formId')}</div>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          className={cn(column.getIsSorted() ? 'bg-muted text-black' : '')}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Created At
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as Date
      return (
        <div className='text-sm'>
          {new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      )
    },
  },
  {
    accessorKey: 'updatedAt',
    header: 'Updated At',
    cell: ({ row }) => {
      const date = row.getValue('updatedAt') as Date
      return (
        <div className='text-sm text-muted-foreground'>
          {new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      )
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const submission = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(submission.submissionId)}
            >
              Copy submission ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link
                viewTransition
                to={ROUTES.DASHBOARD_FORM_SUBMISSION(submission.formId, submission.submissionId)}
              >
                View details
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

type SubmissionsTableProps = {
  data: Submission[]
  onEmailSearch: (query: string) => void
  onClear: () => void
  onSort: (sortingFn: Updater<SortingState>) => void
  onDateChange: (date: Date | undefined) => void
  pagination?: AppPaginationProps | null
}

export function SubmissionsTable({
  data,
  onEmailSearch,
  onClear,
  onSort,
  onDateChange,
  pagination,
}: SubmissionsTableProps) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [searchParams] = useSearchParams()

  const table = useReactTable({
    data,
    columns,
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
    onSortingChange: (sortingFn) => onSort(sortingFn),
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting: [
        {
          id: searchParams.get('sortBy') ?? 'createdAt',
          desc: searchParams.get('sortDirection') === 'desc',
        },
      ],
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className='w-full'>
      <div className='flex items-center gap-2 py-4'>
        <div className='flex items-center gap-4'>
          <Input
            placeholder='Filter by email...'
            defaultValue={searchParams.get('q') ?? ''}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onEmailSearch(e.currentTarget.value)
              }
            }}
            className='md:min-w-[250px]'
          />
          <DatePicker onChange={onDateChange} />
          <Button onClick={onClear} variant='outline'>
            <Trash2Icon className='h-4 w-4' />
          </Button>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' className='ml-auto bg-transparent'>
              Columns <ChevronDown className='ml-2 h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className='capitalize'
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  No submissions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className='flex items-center justify-end space-x-2 py-4'>
        <div className='flex-1 text-sm text-muted-foreground'>
          {table.getFilteredRowModel().rows.length} submission(s) shown
        </div>
        {pagination && (
          <div className='space-x-2'>
            <Link
              onClick={(e) => pagination.currentPage === 1 && e.preventDefault()}
              to={
                pagination.currentPage > 1
                  ? pagination.generatePageLink(pagination.currentPage - 1, location)
                  : '#'
              }
            >
              <Button variant='outline' size='sm' disabled={!pagination.hasPrevious}>
                Previous
              </Button>
            </Link>
            <Link
              onClick={(e) =>
                pagination.currentPage === pagination.totalPages && e.preventDefault()
              }
              to={
                pagination.currentPage < pagination.totalPages
                  ? pagination?.generatePageLink(pagination.currentPage + 1, location)
                  : '#'
              }
            >
              <Button variant='outline' size='sm' disabled={!pagination.hasNext}>
                Next
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
