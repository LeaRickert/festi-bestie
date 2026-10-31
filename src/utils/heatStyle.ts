// The heat style of Heatmap mode (heatmap FR-7, FR-11). One green in 5 heat
// steps, with no legend. An act with no heat looks like an unrated act.
import { type RatingStyle, ratingStyle } from './ratingStyle'

// Heat green of the theme (festivals spec). Use it only in Heatmap mode.
export const HEAT_GREEN = '#107435'

const STEP_ALPHAS = [0.2, 0.4, 0.6, 0.8, 1]

const green = (alpha: number) => `rgba(16, 116, 53, ${alpha})`

// Step 1 is heat below 0.2, step 5 is heat 0.8 or more.
export function heatStep(heat: number): number {
  return Math.min(5, Math.floor(heat * 5) + 1)
}

export function heatStyle(heat: number | null | undefined): RatingStyle {
  if (heat === null || heat === undefined) return ratingStyle(0)
  return { borderColor: HEAT_GREEN, background: green(STEP_ALPHAS[heatStep(heat) - 1]), color: '#ffffff' }
}
