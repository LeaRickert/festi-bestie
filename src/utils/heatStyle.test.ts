import { describe, expect, it } from 'vitest'
import { HEAT_GREEN, heatStep, heatStyle } from './heatStyle'
import { ratingStyle } from './ratingStyle'

const fillAlpha = (heat: number) => Number(heatStyle(heat).background.match(/([\d.]+)\)$/)?.[1])

describe('heat style (heatmap FR-7, FR-11)', () => {
  it('[TC-I43Q] shows an act with no heat (fewer than 5 raters) with no green tint', () => {
    expect(heatStyle(null)).toEqual(ratingStyle(0))
  })

  it('[TC-7MJ0] shows an act with no act_stats row with no green tint', () => {
    expect(heatStyle(undefined)).toEqual(ratingStyle(0))
  })

  it('[TC-2Q72] gives heat 0.9 a stronger green than heat 0.2', () => {
    expect(heatStyle(0.9).borderColor).toBe(HEAT_GREEN)
    expect(fillAlpha(0.9)).toBeGreaterThan(fillAlpha(0.2))
  })

  it('[TC-JW28] puts heat 0.1, 0.3, 0.5, 0.7 and 0.9 in 5 steps with a stronger fill each time', () => {
    const heats = [0.1, 0.3, 0.5, 0.7, 0.9]
    expect(heats.map(heatStep)).toEqual([1, 2, 3, 4, 5])
    const alphas = heats.map(fillAlpha)
    for (let i = 1; i < alphas.length; i++) expect(alphas[i]).toBeGreaterThan(alphas[i - 1])
  })

  it('puts heat 0 in step 1 and heat 1 in step 5', () => {
    expect(heatStep(0)).toBe(1)
    expect(heatStep(1)).toBe(5)
  })
})
