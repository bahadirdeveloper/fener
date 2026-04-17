import { describe, it, expect } from 'vitest'
import { haversineKm, nearestShelter, SILIFKE_CENTER } from '../../data/shelters.js'

describe('haversineKm', () => {
  it('returns 0 for identical points', () => {
    expect(haversineKm([33, 36], [33, 36])).toBe(0)
  })
  it('matches known distance roughly', () => {
    // Silifke merkez ile 1 derece boylam farkı, 36° enlemde ~90km
    const d = haversineKm([33.9336, 36.3775], [34.9336, 36.3775])
    expect(d).toBeGreaterThan(85)
    expect(d).toBeLessThan(95)
  })
})

describe('nearestShelter', () => {
  it('finds a shelter near Silifke center', () => {
    const r = nearestShelter(SILIFKE_CENTER)
    expect(r.feature).toBeTruthy()
    expect(r.distanceKm).toBeLessThan(5)
  })
})
