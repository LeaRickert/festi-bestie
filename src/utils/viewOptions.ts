// The pure rules of the View sheet (view-options FR-5, FR-6, FR-8).
import type { RatingStyle } from './ratingStyle'

export type Mode = 'picks' | 'heatmap'

// The rating style or heat style of an act, dimmed when it does not match the genre.
export type ActStyle = RatingStyle & { opacity?: number }

export const DIMMED_OPACITY = 0.22

// Until group heat exists, Global is the only source (heatmap Known Issues).
const HEAT_SOURCE = 'Global'

// The genres of a festival come from its acts, because they differ by festival.
export const getGenreOptions = (acts: { category: string | null }[]): string[] =>
  [...new Set(acts.map((act) => act.category).filter((category): category is string => Boolean(category)))].sort()

// An unknown ?genre= means no filter, like an unknown ?day=.
export const resolveGenre = (param: string | null, options: string[]): string | null =>
  param && options.includes(param) ? param : null

// With no filter every act matches. With a filter, an act with no genre does not.
export const matchesGenre = (act: { category: string | null }, genre: string | null): boolean =>
  genre === null || act.category === genre

// The caption text, or null for the default view.
export const viewCaption = ({ mode, genre }: { mode: Mode; genre: string | null }): string | null => {
  const parts: string[] = []
  if (mode === 'heatmap') parts.push('Heatmap', HEAT_SOURCE)
  if (genre) parts.push(`${genre} only`)
  return parts.length > 0 ? parts.join(' · ') : null
}
