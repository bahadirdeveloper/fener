import { describe, it, expect } from 'vitest'
import { kitDone, kitPct, KIT_TOTAL } from '../kit.js'

describe('kit', () => {
  it('boş state 0%', () => {
    expect(kitPct({})).toBe(0)
    expect(kitDone({})).toBe(0)
  })
  it('yarı yarıya ≈ %50', () => {
    const half = Math.floor(KIT_TOTAL / 2)
    const state = Object.fromEntries(
      Array.from({ length: half }, (_, i) => [`i${i}`, true])
    )
    expect(kitDone(state)).toBe(half)
    expect(kitPct(state)).toBe(Math.round((half / KIT_TOTAL) * 100))
  })
  it('tüm maddeler işaretli %100', () => {
    const all = Object.fromEntries(
      Array.from({ length: KIT_TOTAL }, (_, i) => [`i${i}`, true])
    )
    expect(kitPct(all)).toBe(100)
  })
  it('false değerler sayılmaz', () => {
    expect(kitDone({ a: true, b: false, c: false, d: true })).toBe(2)
  })
})
