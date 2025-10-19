import * as functions from 'firebase-functions'
import sgMail from '@sendgrid/mail'

const key = functions.config().sendgrid?.key
if (key) sgMail.setApiKey(key)

export const sendReportEmail = functions.https.onCall(async (data, context) => {
  if (!context.auth?.uid) throw new functions.https.HttpsError('unauthenticated', 'Login required')
  if (!key) throw new functions.https.HttpsError('failed-precondition', 'Email not configured')

  const { to, subject, html, attachments } = data as {
    to: string[]
    subject: string
    html: string
    attachments?: { filename: string; type: string; content: string }[]
  }
  if (!Array.isArray(to) || to.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Recipients required')
  }
  if (!subject || !html) {
    throw new functions.https.HttpsError('invalid-argument', 'Subject and html required')
  }

  const msgs = to.map((email) => ({
    to: email,
    from: 'yujiesyun@gmail.com',
    subject,
    html,
    attachments: (attachments ?? []).map((a) => ({
      filename: a.filename,
      type: a.type,
      content: a.content,
      disposition: 'attachment',
    })),
  }))

  const result = await sgMail.send(msgs, false)
  return { sent: result.length }
})
