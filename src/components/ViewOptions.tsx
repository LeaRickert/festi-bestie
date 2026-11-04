import { useSearchParams } from 'react-router'
import { ListFilter } from 'lucide-react'
import type { Mode } from '../utils/viewOptions'
import Sheet from './Sheet'

// The color mode and the genre live in the URL as ?mode=heatmap and ?genre=, like
// ?day=, so a reload keeps them. One hook owns both, because two setSearchParams
// calls in one tick do not build on each other (view-options FR-4, FR-5, FR-9).
export const useViewParams = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const mode: Mode = searchParams.get('mode') === 'heatmap' ? 'heatmap' : 'picks'

  const update = (change: (params: URLSearchParams) => void) => {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev)
        change(params)
        return params
      },
      { replace: true },
    )
  }

  return {
    mode,
    // The raw value. The page checks it against the genres of the festival.
    genreParam: searchParams.get('genre'),
    setMode: (next: Mode) =>
      update((params) => {
        if (next === 'heatmap') params.set('mode', 'heatmap')
        else params.delete('mode')
      }),
    setGenre: (next: string | null) =>
      update((params) => {
        if (next) params.set('genre', next)
        else params.delete('genre')
      }),
    resetView: () =>
      update((params) => {
        params.delete('mode')
        params.delete('genre')
      }),
  }
}

const MODES: { value: Mode; label: string }[] = [
  { value: 'picks', label: 'My picks' },
  { value: 'heatmap', label: 'Heatmap' },
]

interface ViewButtonProps {
  // The caption text, or null for the default view.
  caption: string | null
  onOpen: () => void
}

// The View button, with a dot when the view is not the default (view-options FR-1, FR-8).
export const ViewButton = ({ caption, onOpen }: ViewButtonProps) => (
  <button
    type="button"
    onClick={onOpen}
    aria-label={caption ? `View options: ${caption}` : 'View options'}
    className="relative flex shrink-0 items-center self-stretch px-3 py-1.5 bg-white/10 text-white/80 rounded-md hover:bg-white/20 transition-colors text-sm"
  >
    <ListFilter className="h-4 w-4 mr-1.5" />
    View
    {caption && <span aria-hidden="true" className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-link" />}
  </button>
)

interface ViewCaptionProps {
  caption: string
  onOpen: () => void
}

// One line under the View button row, shown only when the view is not the default (view-options FR-8).
export const ViewCaption = ({ caption, onOpen }: ViewCaptionProps) => (
  <button type="button" onClick={onOpen} className="block max-w-full truncate px-0.5 text-left text-xs text-link">
    {caption}
  </button>
)

interface ChoiceProps {
  selected: boolean
  onSelect: () => void
  label: string
}

const GenreChip = ({ selected, onSelect, label }: ChoiceProps) => (
  <button
    type="button"
    aria-pressed={selected}
    onClick={onSelect}
    className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
      selected ? 'bg-white text-page font-medium' : 'bg-white/10 text-white/80 hover:bg-white/20'
    }`}
  >
    {label}
  </button>
)

interface ViewSheetProps {
  mode: Mode
  onModeChange: (mode: Mode) => void
  genres: string[]
  genre: string | null
  onGenreChange: (genre: string | null) => void
  // The time grid passes the "Later times on top" setting; other views have no layout choice (view-options FR-7).
  laterOnTop?: { value: boolean; onChange: (value: boolean) => void }
  isDefault: boolean
  onReset: () => void
  onClose: () => void
}

const fieldLabel = 'mb-1.5 text-xs font-semibold text-white/60'

// The View sheet. Each change applies at once and the sheet stays open (view-options FR-3).
export const ViewSheet = ({ mode, onModeChange, genres, genre, onGenreChange, laterOnTop, isDefault, onReset, onClose }: ViewSheetProps) => (
  <Sheet
    titleId="view-sheet-title"
    lightBackdrop
    header={
      <h2 id="view-sheet-title" className="text-lg font-bold text-white">
        View
      </h2>
    }
    onClose={onClose}
  >
    <div className="flex flex-col gap-4">
      <fieldset>
        <legend className={fieldLabel}>Color by</legend>
        <div className="flex gap-1 bg-page rounded-lg p-1">
          {MODES.map(({ value, label }) => (
            <button
              type="button"
              aria-pressed={mode === value}
              key={value}
              onClick={() => onModeChange(value)}
              className={`flex-1 py-1.5 px-2 rounded-md whitespace-nowrap text-sm font-medium transition-colors ${
                mode === value ? 'bg-white text-page' : 'text-white/80 hover:bg-white/10'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {mode === 'heatmap' && (
          <p className="mt-1.5 text-xs text-white/60">How much everyone wants to see each act. Updated every 15 minutes.</p>
        )}
      </fieldset>

      {genres.length > 0 && (
        <fieldset>
          <legend className={fieldLabel}>Filter by genre category</legend>
          <div className="flex flex-wrap gap-1.5">
            <GenreChip label="All" selected={genre === null} onSelect={() => onGenreChange(null)} />
            {genres.map((option) => (
              <GenreChip key={option} label={option} selected={genre === option} onSelect={() => onGenreChange(option)} />
            ))}
          </div>
        </fieldset>
      )}

      {laterOnTop && (
        <div>
          <p className={fieldLabel}>Layout</p>
          <button
            type="button"
            role="switch"
            aria-checked={laterOnTop.value}
            onClick={() => laterOnTop.onChange(!laterOnTop.value)}
            className="flex min-h-11 w-full items-center justify-between gap-3 text-left text-sm text-white/80"
          >
            Later times on top
            <span className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${laterOnTop.value ? 'bg-white' : 'bg-white/20'}`}>
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full transition-all ${laterOnTop.value ? 'left-[18px] bg-page' : 'left-0.5 bg-white'}`}
              />
            </span>
          </button>
        </div>
      )}

      {!isDefault && (
        <button type="button" onClick={onReset} className="self-start text-sm text-link">
          Reset to My picks and all genres
        </button>
      )}
    </div>
  </Sheet>
)
