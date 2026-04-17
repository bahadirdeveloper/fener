import { describe, it, expect } from 'vitest'
import { buildStatusText, whatsappLink } from '../outbox.js'

describe('buildStatusText', () => {
  it('includes name and ok marker', () => {
    const t = buildStatusText({ type: 'ok', name: 'Ali', lat: 36.38, lng: 33.93 })
    expect(t).toContain('Ali')
    expect(t).toContain('BEN İYİYİM')
    expect(t).toContain('36.38000')
  })
  it('help variant', () => {
    const t = buildStatusText({ type: 'help', name: 'Veli' })
    expect(t).toContain('YARDIM LAZIM')
  })
  it('works without location', () => {
    const t = buildStatusText({ type: 'ok' })
    expect(t).not.toContain('Konum:')
  })
})

describe('whatsappLink', () => {
  it('normalizes Turkish phone with leading zero', () => {
    const l = whatsappLink('0532 123 45 67', 'test')
    expect(l).toContain('wa.me/905321234567')
  })
  it('preserves country code if already present', () => {
    const l = whatsappLink('+90 532 123 45 67', 'test')
    expect(l).toContain('wa.me/905321234567')
  })
  it('adds 90 for 10-digit local number', () => {
    const l = whatsappLink('5321234567', 'x')
    expect(l).toContain('wa.me/905321234567')
  })
})
