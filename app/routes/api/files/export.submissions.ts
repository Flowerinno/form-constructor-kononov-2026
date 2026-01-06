import Papa from 'papaparse'
import { UNSAFE_invariant } from 'react-router'
import type { FormDefaultType } from '~/core/editor/types'
import { prisma } from '~/db'
import { getFilePrefix } from '~/lib/utils'
import { authMiddleware, userContext } from '~/middleware/auth'
import type { Route } from './+types/export.submissions'

export const middleware: Route.MiddlewareFunction[] = [authMiddleware]

export const loader = async ({ params, context }: Route.LoaderArgs) => {
  const userData = context.get(userContext)
  UNSAFE_invariant(userData, 'User must be authenticated to export submissions')

  const [form, submissions] = await Promise.all([
    prisma.form.findFirst({
      where: {
        formId: params.formId,
        creatorId: userData.userId,
      },
      select: {
        formId: true,
        pages: {
          select: {
            pageNumber: true,
            pageFields: true,
          },
        },
      },
    }),
    prisma.formSubmission.findMany({
      where: {
        formId: params.formId,
      },
      select: {
        submissionId: true,
        createdAt: true,
        participant: {
          select: {
            participantId: true,
            email: true,
          },
        },
        pageAnswers: {
          select: {
            referencePageId: true,
            page: {
              select: {
                pageId: true,
                pageNumber: true,
              },
            },
            fieldAnswers: {
              select: {
                fieldId: true,
                answer: true,
                type: true,
              },
            },
          },
        },
      },
    }),
  ])

  if (!form) {
    throw new Error('Form not found or you do not have permission to export its submissions')
  }

  if (!submissions || submissions.length === 0) {
    return new Response('No submissions found to export.', {
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  }

  const fieldLabelMap = new Map<string, string>()
  form.pages.forEach((p) => {
    const fields = JSON.parse(p.pageFields as string) as FormDefaultType
    fields.content.forEach((f) => fieldLabelMap.set(f.props.id, f.props.label))
  })

  const rows: Record<string, string>[] = []
  for (const s of submissions) {
    const row: Record<string, string> = {
      SUBMISSION_ID: s.submissionId,
      Date: s.createdAt.toLocaleString(),
      Email: s.participant?.email,
    }

    s.pageAnswers.forEach((fa) => {
      fa.fieldAnswers.forEach((ans) => {
        const label = fieldLabelMap.get(ans.fieldId) || `Field: ${ans.fieldId}`
        row[label] =
          ans.type === 'FILEFIELD'
            ? `[Search by: ${getFilePrefix({
                formId: params.formId,
                pageId: fa.referencePageId,
                participantId: s.participant?.participantId,
                fieldId: ans.fieldId,
              })}]`
            : ans.answer
      })
    })
    rows.push(row)
  }

  const keys = rows.map((obj) => Object.keys(obj)).sort((a, b) => b.length - a.length)[0]

  const csv = Papa.unparse({
    fields: keys,
    data: rows,
  })

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="export.csv"',
    },
  })
}
