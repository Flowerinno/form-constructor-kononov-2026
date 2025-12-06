import { Resend } from 'resend'
import { logger } from '~/lib/logger'

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendEmail = async (
  emails: string | string[],
  data: { subject: string; html: string },
) => {
  try {
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: Array.isArray(emails) ? emails : [emails],
      subject: data.subject,
      html: data.html,
    })

    if (error) {
      throw new Error(`Resend API error: ${error.message}`)
    }
  } catch (error) {
    logger.error(error, 'Failed to send email via Resend API')
  }
}
