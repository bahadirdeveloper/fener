import { describe, it, expect } from 'vitest'
import { HAZARDS } from '../../data/hazards.js'

function pointInRing(point, ring) {
  const [x, y] = point
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    const intersect = ((yi > y) !== (yj > y)) &&
      (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
    if (intersect) inside = !inside
  }
  return inside
}

function pointInHazard(point) {
  return HAZARDS.features.find((f) => pointInRing(point, f.geometry.coordinates[0]))
}

describe('hazard containment', () => {
  it('detects a point inside Taşucu coastal polygon', () => {
    const hit = pointInHazard([33.89, 36.313])
    expect(hit?.properties?.id).toBe('tasucu-coastal')
  })
  it('excludes a point far from any hazard', () => {
    expect(pointInHazard([30.0, 40.0])).toBeUndefined()
  })
  it('detects Akdere landslide polygon', () => {
    const hit = pointInHazard([33.982, 36.407])
    expect(hit?.properties?.kind).toBe('landslide')
  })
})
