// Cihaz verisi JSON export/import.

import { db } from './db.js'

export async function exportAll() {
  const [profile, family, contacts, meetingPoints, outbox] = await Promise.all([
    db.profile.toArray(),
    db.family.toArray(),
    db.contacts.toArray(),
    db.meetingPoints.toArray(),
    db.outbox.toArray()
  ])
  return {
    app: 'fener',
    version: 1,
    exportedAt: new Date().toISOString(),
    profile,
    family,
    contacts,
    meetingPoints,
    outbox
  }
}

export function downloadBackup(obj) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const date = new Date().toISOString().slice(0, 10)
  a.download = `fener-backup-${date}.json`
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function importBackup(obj, { merge = true } = {}) {
  if (obj?.app !== 'fener') throw new Error('Geçersiz yedek dosyası')
  if (!merge) {
    await Promise.all([
      db.profile.clear(),
      db.family.clear(),
      db.contacts.clear(),
      db.meetingPoints.clear(),
      db.outbox.clear()
    ])
  }
  if (obj.profile?.length) await db.profile.bulkPut(obj.profile)
  if (obj.family?.length) await db.family.bulkPut(obj.family.map(stripId))
  if (obj.contacts?.length) await db.contacts.bulkPut(obj.contacts.map(stripId))
  if (obj.meetingPoints?.length) await db.meetingPoints.bulkPut(obj.meetingPoints.map(stripId))
}

function stripId(row) {
  // eslint-disable-next-line no-unused-vars
  const { id, ...rest } = row
  return rest
}
