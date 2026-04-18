// TR telefon numarası normalizasyonu. WhatsApp wa.me linki için ülke kodlu
// format gerekir (başında + yok, 90 ile başlar). Kullanıcı 0/+90/90/5xx
// formatlarında girebilir; boşluk, tire, parantez temizlenir.

export function normalizeTrPhone(raw) {
  if (!raw) return ''
  let s = String(raw).replace(/[^\d+]/g, '')
  if (s.startsWith('+')) s = s.slice(1)
  if (s.startsWith('0')) s = s.slice(1)
  if (s.startsWith('90')) s = s.slice(2)
  if (!s) return ''
  return '90' + s
}

export function telHref(raw) {
  const s = String(raw || '').replace(/\s+/g, '')
  return s ? `tel:${s}` : ''
}
