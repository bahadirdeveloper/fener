import { describe, it, expect } from 'vitest'
import { tilesFor, estimatedSizeMB } from '../tilePrefetch.js'

describe('tilesFor', () => {
  it('returns tiles within reasonable count for Silifke bbox', () => {
    const tiles = tilesFor()
    expect(tiles.length).toBeGreaterThan(20)
    expect(tiles.length).toBeLessThan(2000)
  })
  it('all tiles have valid z/x/y', () => {
    const tiles = tilesFor()
    for (const t of tiles) {
      expect(Number.isInteger(t.z)).toBe(true)
      expect(Number.isInteger(t.x)).toBe(true)
      expect(Number.isInteger(t.y)).toBe(true)
      expect(t.z).toBeGreaterThanOrEqual(0)
    }
  })
  it('estimated size reasonable', () => {
    const mb = estimatedSizeMB()
    expect(mb).toBeGreaterThan(0)
    expect(mb).toBeLessThan(50)
  })
})
