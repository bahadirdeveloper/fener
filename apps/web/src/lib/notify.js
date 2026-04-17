// Local notifications via Notification API. Gerçek push değil — SW/tab açıkken alarm.

export function hasNotify() {
  return typeof Notification !== 'undefined'
}

export async function ensureNotifyPerm() {
  if (!hasNotify()) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  return Notification.requestPermission()
}

export function notifyLocal(title, body, { tag = 'fener', url = '/' } = {}) {
  if (!hasNotify() || Notification.permission !== 'granted') return null
  const n = new Notification(title, {
    body,
    tag,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    silent: false
  })
  n.onclick = () => {
    window.focus()
    if (url) location.hash = url
    n.close()
  }
  return n
}
