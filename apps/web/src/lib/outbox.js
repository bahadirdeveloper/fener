import { pushOutbox, markOutboxSent, listFamily, db } from './db.js'
import { normalizeTrPhone } from './phone.js'

const WHATSAPP_BASE = 'https://wa.me/'
const SMS_BASE = 'sms:'

export function buildStatusText({ type, name, lat, lng }) {
  const who = name ? `${name}: ` : ''
  const head = type === 'ok'
    ? `${who}BEN İYİYİM ✅`
    : `${who}YARDIM LAZIM 🆘`
  const where = (lat != null && lng != null)
    ? `\nKonum: https://maps.google.com/?q=${lat.toFixed(5)},${lng.toFixed(5)}`
    : ''
  const time = `\nSaat: ${new Date().toLocaleString('tr-TR')}`
  return `${head}${where}${time}\n— Fener`
}

export function whatsappLink(phone, text) {
  return `${WHATSAPP_BASE}${normalizeTrPhone(phone)}?text=${encodeURIComponent(text)}`
}

export function smsLink(phone, text) {
  return `${SMS_BASE}${normalizeTrPhone(phone)}?body=${encodeURIComponent(text)}`
}

export async function queueStatus({ type, lat, lng, name }) {
  const text = buildStatusText({ type, name, lat, lng })
  const id = await pushOutbox({ type: `status:${type}`, text, lat, lng })
  return { id, text }
}

export async function familyWhatsAppLinks(text) {
  const fam = await listFamily()
  return fam
    .filter((m) => m.phone)
    .map((m) => ({ name: m.name, url: whatsappLink(m.phone, text) }))
}

export async function purgeOutbox() {
  await db.outbox.clear()
}

export { markOutboxSent }
