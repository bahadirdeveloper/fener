// Web Bluetooth scaffold. Faz 2'de gerçek mesaj taşıma eklenecek.
// Şu an: yakın Fener cihazlarını keşif + bağlanma prototipi.

export const FENER_SERVICE_UUID = '7f000000-fe6e-4e00-9b34-000000000001'
export const FENER_TX_CHAR_UUID  = '7f000000-fe6e-4e00-9b34-000000000002'
export const FENER_RX_CHAR_UUID  = '7f000000-fe6e-4e00-9b34-000000000003'

export function isBleSupported() {
  return typeof navigator !== 'undefined' && 'bluetooth' in navigator
}

export async function isAvailable() {
  if (!isBleSupported()) return false
  try { return await navigator.bluetooth.getAvailability() } catch { return false }
}

export async function discoverFener() {
  if (!isBleSupported()) throw new Error('Web Bluetooth desteklenmiyor')
  const device = await navigator.bluetooth.requestDevice({
    filters: [{ services: [FENER_SERVICE_UUID] }],
    optionalServices: [FENER_SERVICE_UUID]
  })
  return device
}

export async function connect(device) {
  const server = await device.gatt.connect()
  const service = await server.getPrimaryService(FENER_SERVICE_UUID)
  const tx = await service.getCharacteristic(FENER_TX_CHAR_UUID)
  const rx = await service.getCharacteristic(FENER_RX_CHAR_UUID)
  await rx.startNotifications()
  return { server, service, tx, rx }
}

export async function send(tx, envelope) {
  const data = new TextEncoder().encode(JSON.stringify(envelope))
  // GATT MTU ~512, parçala
  const CHUNK = 180
  for (let i = 0; i < data.length; i += CHUNK) {
    await tx.writeValueWithoutResponse(data.slice(i, i + CHUNK))
  }
  // EOT marker
  await tx.writeValueWithoutResponse(new Uint8Array([0x04]))
}

export function onReceive(rx, handler) {
  const buf = []
  const listener = (e) => {
    const data = new Uint8Array(e.target.value.buffer)
    if (data.length === 1 && data[0] === 0x04) {
      const full = new Uint8Array(buf.flat())
      buf.length = 0
      try {
        const text = new TextDecoder().decode(full)
        const env = JSON.parse(text)
        handler(env)
      } catch {
        handler({ raw: full })
      }
      return
    }
    buf.push(Array.from(data))
  }
  rx.addEventListener('characteristicvaluechanged', listener)
  return () => rx.removeEventListener('characteristicvaluechanged', listener)
}
