import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { zonedTimeToUtc } from 'date-fns-tz'

admin.initializeApp()
const db = admin.firestore()

export const bookAppointment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Sign in required.')
  }

  const {
    startLocalISO,
    endLocalISO,
    title = 'Appointment',
    notes = '',
    serviceType = 'general',
  } = data
  const tz = 'Australia/Melbourne'

  const startUTC = zonedTimeToUtc(startLocalISO, tz)
  const endUTC = zonedTimeToUtc(endLocalISO, tz)

  if (!(startUTC instanceof Date) || !(endUTC instanceof Date) || startUTC >= endUTC) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid time range.')
  }

  const durationMin = (endUTC.getTime() - startUTC.getTime()) / (60 * 1000)
  if (durationMin < 15 || durationMin > 180) {
    throw new functions.https.HttpsError('failed-precondition', 'Duration must be 15–180 minutes.')
  }

  const userId = context.auth.uid
  const apptRef = db.collection('appointments').doc()

  await db.runTransaction(async (tx) => {
    const qSnap = await tx.get(
      db
        .collection('appointments')
        .where('status', '==', 'confirmed')
        .where('start', '<', admin.firestore.Timestamp.fromDate(endUTC)),
    )

    const conflict = qSnap.docs.some((d) => {
      const s = d.get('start')?.toDate?.()
      const e = d.get('end')?.toDate?.()
      if (!s || !e) return false
      return e > startUTC && s < endUTC
    })

    if (conflict) {
      throw new functions.https.HttpsError('already-exists', 'Time slot is already booked.')
    }

    const now = admin.firestore.FieldValue.serverTimestamp()
    tx.set(apptRef, {
      start: admin.firestore.Timestamp.fromDate(startUTC),
      end: admin.firestore.Timestamp.fromDate(endUTC),
      userId,
      status: 'confirmed',
      title,
      notes,
      serviceType,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    })
  })

  return { ok: true, id: apptRef.id }
})
