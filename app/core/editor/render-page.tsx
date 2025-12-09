import { Render } from '@measured/puck'
import type { Form, Page } from 'generated/prisma/client'
import { useConfig } from './useConfig'

type RenderPageProps = {
  formId: string
  pageId: string
  isPreview?: boolean
  page: Page
  pagesTotal: number
  theme: Form['theme']
}

const RenderPage = (props: RenderPageProps) => {
  const objectToPass = {
    formId: props.formId,
    pageId: props.pageId,
    isPreview: props.isPreview || false,
    page: props.page,
    pagesTotal: props.pagesTotal,
    theme: props.theme,
  }
  const config = useConfig(objectToPass)
  return (
    <Render
      key={`${props.pageId}-${props.theme}`}
      config={config}
      metadata={objectToPass}
      data={JSON.parse(props.page.pageFields as string)}
    />
  )
}

export { RenderPage }
