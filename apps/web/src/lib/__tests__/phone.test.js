import { describe, it, expect } from 'vitest'
import { normalizeTrPhone } from '../phone.js'

describe('normalizeTrPhone', () => {
  it('0 ile başlayanı 90 ile değiştirir', () => {
    expect(normalizeTrPhone('05551234567')).toBe('905551234567')
  })
  it('+90 prefixini temizler', () => {
    expect(normalizeTrPhone('+905551234567')).toBe('905551234567')
  })
  it('zaten 90 ile başlayanı değiştirmez', () => {
    expect(normalizeTrPhone('905551234567')).toBe('905551234567')
  })
  it('sadece 5xx girilince 90 ekler', () => {
    expect(normalizeTrPhone('5551234567')).toBe('905551234567')
  })
  it('boşluk ve noktalama temizler', () => {
    expect(normalizeTrPhone('(555) 123-45 67')).toBe('905551234567')
  })
  it('boş girişe boş döner', () => {
    expect(normalizeTrPhone('')).toBe('')
    expect(normalizeTrPhone(null)).toBe('')
    expect(normalizeTrPhone(undefined)).toBe('')
  })
})
