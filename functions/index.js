/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { setGlobalOptions } = require('firebase-functions')
const { onRequest } = require('firebase-functions/https')
const logger = require('firebase-functions/logger')

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 })

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
const functions = require('firebase-functions')
const express = require('express')
const cors = require('cors')
const sgMail = require('@sendgrid/mail')

const app = express()
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://你的正式網域.example.com',
]
app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true)
      if (allowedOrigins.includes(origin)) return cb(null, true)
      return cb(new Error('Not allowed by CORS'))
    },
  }),
)
app.use(express.json({ limit: '10mb' }))

const SENDGRID_KEY = functions.config().sendgrid?.key
const FROM_EMAIL = functions.config().sendgrid?.from
if (!SENDGRID_KEY || !FROM_EMAIL) {
  console.warn('[WARN] Missing SendGrid config.')
}
sgMail.setApiKey(SENDGRID_KEY)

// 健康檢查
app.get('/api/health', (req, res) => res.status(200).json({ ok: true }))

// 寄信（支援單/多附件）
app.post('/api/sendEmail', async (req, res) => {
  try {
    let { to, subject, text, html, attachment, attachments } = req.body || {}
    if (!to || !subject) return res.status(400).json({ error: 'Missing "to" or "subject"' })

    // 正規化收件者
    const toList = Array.isArray(to)
      ? to
      : String(to)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)

    // 整理附件（只接受「純 base64」）
    let atts = []
    if (Array.isArray(attachments) && attachments.length) {
      atts = attachments.map((a) => ({
        content: String(a.content || ''),
        filename: a.filename || 'attachment',
        type: a.type || 'application/octet-stream',
        disposition: 'attachment',
      }))
    } else if (attachment?.content) {
      atts = [
        {
          content: String(attachment.content || ''),
          filename: attachment.filename || 'attachment',
          type: attachment.type || 'application/octet-stream',
          disposition: 'attachment',
        },
      ]
    } else if (attachment?.contentBase64) {
      // 兼容你先前單附件欄位名
      atts = [
        {
          content: String(attachment.contentBase64 || ''),
          filename: attachment.filename || 'attachment',
          type: attachment.type || 'application/octet-stream',
          disposition: 'attachment',
        },
      ]
    }

    const msg = {
      to: toList,
      from: FROM_EMAIL,
      subject,
      text: text || '',
      html: html || undefined,
      attachments: atts.length ? atts : undefined,
    }

    const [resp] = await sgMail.send(msg) // 成功通常 202
    return res.status(200).json({ ok: true, sgStatus: resp.statusCode })
  } catch (err) {
    console.error('Send email error:', err?.response?.body || err)
    return res.status(500).json({ ok: false, error: err?.message || 'Send failed' })
  }
})

exports.api = functions.region('us-central1').https.onRequest(app)
