export const EMAIL_TEMPLATES = {
  emailConfirmation: {
    subject: 'Email confirmation',
    html: (link: string) => `
      <html>
        <body>
          <h1>Please confirm your email by clicking on this link <a href="${link}" target="_blank">${link}</a></h1>
        </body>
      </html>
    `,
  },
  authLink: {
    subject: 'Authentication Link',
    html: (link: string) => `
      <html>
        <body>
          <h1>Please click on this login link to continue: <a href="${link}" target="_blank">${link}</a></h1>
        </body>
      </html>
    `,
  },
} as const

export const ERROR_MESSAGES = {
  generic: 'Something went wrong. Please try again later.',
  authenticationFailed: 'Authentication failed.',
  failedOperation: 'Failed to complete the operation. Please try again.',
} as const

export const TIME = {
  ONE_MINUTE: 60 * 1000,
  FIVE_MINUTES: 5 * 60 * 1000,
  TEN_MINUTES: 10 * 60 * 1000,
  ONE_WEEK: 7 * 24 * 60 * 60 * 1000,
}

export const FIELD_TYPE_MAP = {
  ButtonBlock: 'BUTTONBLOCK',
  TextInputField: 'TEXTINPUTFIELD',
  TextareaField: 'TEXTAREAFIELD',
  SelectField: 'SELECTFIELD',
  RadioGroupField: 'RADIOGROUPFIELD',
  CheckboxField: 'CHECKBOXFIELD',
  FileField: 'FILEFIELD',
} as const

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  TAKE: 12,
}
