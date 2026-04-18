import { describe, it, expect } from 'vitest'
import { hazardAt } from '../../data/hazards.js'

describe('hazardAt', () => {
  it('detects a point inside Taşucu coastal polygon', () => {
    expect(hazardAt([33.89, 36.313])?.properties?.id).toBe('tasucu-coastal')
  })
  it('excludes a point far from any hazard', () => {
    expect(hazardAt([30.0, 40.0])).toBeNull()
  })
  it('detects Akdere landslide polygon', () => {
    expect(hazardAt([33.982, 36.407])?.properties?.kind).toBe('landslide')
  })
})
