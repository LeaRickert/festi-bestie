import { useSearchParams } from 'react-router'

export type Mode = 'picks' | 'heatmap'

// The mode lives in the URL as ?mode=heatmap, like ?day=, so a reload keeps it.
// "My picks" is the default (heatmap FR-1).
export const useMode = (): [Mode, (mode: Mode) => void] => {
  const [searchParams, setSearchParams] = useSearchParams()
  const mode: Mode = searchParams.get('mode') === 'heatmap' ? 'heatmap' : 'picks'

  const setMode = (next: Mode) => {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev)
        if (next === 'heatmap') params.set('mode', 'heatmap')
        else params.delete('mode')
        return params
      },
      { replace: true },
    )
  }

  return [mode, setMode]
}

const MODES: { value: Mode; label: string }[] = [
  { value: 'picks', label: 'My picks' },
  { value: 'heatmap', label: 'Heatmap' },
]

interface ModeControlProps {
  mode: Mode
  onChange: (mode: Mode) => void
}

// The mode control of each act view (heatmap FR-1). Until groups exist the only
// source is "Global", so the source choice is hidden (heatmap Known Issues).
const ModeControl = ({ mode, onChange }: ModeControlProps) => (
  <div className="flex gap-1 bg-surface rounded-lg p-1" role="tablist" aria-label="Mode">
    {MODES.map(({ value, label }) => (
      <button
        type="button"
        role="tab"
        aria-selected={mode === value}
        key={value}
        onClick={() => onChange(value)}
        className={`flex-1 py-1.5 px-2 rounded-md whitespace-nowrap text-sm font-medium transition-colors ${
          mode === value ? 'bg-white text-page' : 'text-white/80 hover:bg-white/10'
        }`}
      >
        {label}
      </button>
    ))}
  </div>
)

export default ModeControl
