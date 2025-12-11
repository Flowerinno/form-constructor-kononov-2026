import type { ComponentsEnum } from './useConfig'

export type FormDefaultType = {
  root: {
    props: Record<string, string | number>
  }
  content: {
    type: (typeof ComponentsEnum)[number]
    props: {
      id: string
      label: string
      required?: boolean
      options?: {
        label: string
        value: string
      }[]
    }
  }[]
  zones: {}
}
