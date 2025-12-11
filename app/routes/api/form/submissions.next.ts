import { type FileUpload, parseFormData } from '@remix-run/form-data-parser'
import type { Route } from './+types/submissions.next'

const uploadHandler = async (fileUpload: FileUpload) => {}

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await parseFormData(request, uploadHandler)
  const file = formData.get('avatar')
  console.log('Form Data:', formData)
  return { message: 'Hello World' }
}
