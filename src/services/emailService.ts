import { getFunctions, httpsCallable } from 'firebase/functions'

type Attachment = { filename: string; type: string; content: string } // base64

export async function sendReportEmail(payload: {
  to: string[]
  subject: string
  html: string
  attachments?: Attachment[]
}) {
  const fns = getFunctions()
  const callable = httpsCallable(fns, 'sendReportEmail')
  const res = await callable(payload)
  return res.data as { sent: number }
}
