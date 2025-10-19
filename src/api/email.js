/** @typedef {{to?: string, subject?: string, text?: string, html?: string, attachments?: Array<{filename:string, content:string}>}} SendEmailPayload */

export async function sendEmailRaw(payload /*: SendEmailPayload */) {
  console.warn('[stub] sendEmailRaw called:', payload)
  return { ok: true, id: 'stub-email-id', status: 202 }
}

export async function sendEmail(payload) {
  return sendEmailRaw(payload)
}

export async function sendEmailWithAttachment(payload) {
  return sendEmailRaw(payload)
}

const emailApi = { sendEmailRaw, sendEmail, sendEmailWithAttachment }
export default emailApi
