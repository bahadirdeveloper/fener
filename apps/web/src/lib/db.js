import Dexie from 'dexie'

export const db = new Dexie('fener')

db.version(1).stores({
  profile: 'id',
  contacts: '++id, name, phone, role',
  family: '++id, name, phone, relation, isPrimary',
  meetingPoints: '++id, name, lat, lng, priority',
  outbox: '++id, type, createdAt, status',
  shelters: 'id, name, lat, lng',
  nodes: 'id, kind, lastSeen'
})

db.version(2).stores({
  meetingPoints: '++id, name, lat, lng, priority, kind'
})

export async function getProfile() {
  return (await db.profile.get('me')) ?? null
}

export async function saveProfile(data) {
  await db.profile.put({ id: 'me', ...data, updatedAt: Date.now() })
}

export async function listContacts() {
  return db.contacts.toArray()
}

export async function listFamily() {
  return db.family.toArray()
}

export async function listOutbox() {
  return db.outbox.orderBy('createdAt').reverse().toArray()
}

export async function pushOutbox(msg) {
  return db.outbox.add({
    ...msg,
    createdAt: Date.now(),
    status: 'pending'
  })
}

export async function markOutboxSent(id) {
  await db.outbox.update(id, { status: 'sent', sentAt: Date.now() })
}
