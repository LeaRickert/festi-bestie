// The rating labels and the rating style (ratings FR-2, FR-10, export FR-8).
// The time grid, the act cards and the export image all use ratingStyle, so a
// rating looks the same everywhere.

// Rating accent of the theme (festivals spec). Use it only for ratings.
export const RATING_ACCENT = '#9e1fb3'

const RATING_LABELS: Record<number, string> = {
  1: 'Not for me',
  2: 'Meh',
  3: 'Interested',
  4: 'Hyped',
  5: 'Must See!',
}

export function ratingLabel(rating: number): string {
  return RATING_LABELS[rating] ?? 'Not rated'
}

export interface RatingStyle {
  borderColor: string
  background: string
  color: string
}

const magenta = (alpha: number) => `rgba(158, 31, 179, ${alpha})`
const white = (alpha: number) => `rgba(170, 170, 170, ${alpha})`

// Plain CSS values, so they work in a React style object and in the export HTML.
export function ratingStyle(rating: number): RatingStyle {
  if (rating === 1) return { borderColor: white(0.4), background: 'transparent', color: white(0.8) }
  if (rating === 3) return { borderColor: RATING_ACCENT, background: 'transparent', color: '#ffffff' }
  if (rating === 4) return { borderColor: RATING_ACCENT, background: magenta(0.2), color: '#ffffff' }
  if (rating === 5) return { borderColor: RATING_ACCENT, background: magenta(0.7), color: '#ffffff' }
  return { borderColor: white(0.7), background: 'transparent', color: '#ffffff' }
}
