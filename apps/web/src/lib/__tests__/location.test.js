import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('getLastKnownPosition', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      _s: {},
      getItem(k) { return this._s[k] ?? null },
      setItem(k, v) { this._s[k] = String(v) },
      removeItem(k) { delete this._s[k] },
      clear() { this._s = {} }
    })
  })

  it('boş storage için null döner', async () => {
    const { getLastKnownPosition } = await import('../location.js?v=1')
    expect(getLastKnownPosition()).toBeNull()
  })

  it('getPosition başarısında cache\'e yazar', async () => {
    const coords = { latitude: 36.38, longitude: 33.93, accuracy: 10 }
    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: (ok) => ok({ coords, timestamp: 123 })
      }
    })
    const { getPosition, getLastKnownPosition } = await import('../location.js?v=2')
    await getPosition()
    const last = getLastKnownPosition()
    expect(last?.lat).toBe(36.38)
    expect(last?.lng).toBe(33.93)
  })

  it('bozuk JSON\'u yok sayar', async () => {
    localStorage.setItem('fener.lastPos.v1', 'not json')
    const { getLastKnownPosition } = await import('../location.js?v=3')
    expect(getLastKnownPosition()).toBeNull()
  })
})
