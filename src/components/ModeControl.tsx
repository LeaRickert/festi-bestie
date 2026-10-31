import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { InfoIcon } from 'lucide-react'
import Sheet from './Sheet'

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
const ModeControl = ({ mode, onChange }: ModeControlProps) => {
  const [infoOpen, setInfoOpen] = useState(false)

  return (
    <div className="flex items-center gap-2">
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

      {mode === 'heatmap' && (
        <button
          type="button"
          onClick={() => setInfoOpen(true)}
          aria-label="How the heatmap works"
          className="flex items-center px-1 py-1.5 text-white/80 rounded-md hover:bg-white/20 transition-colors text-sm"
        >
          <InfoIcon className="h-4 w-4" />
        </button>
      )}

      {infoOpen && (
        <Sheet
          titleId="heatmap-info-title"
          header={
            <h2 id="heatmap-info-title" className="text-lg font-bold text-white">
             Heatmap Info
            </h2>
          }
          onClose={() => setInfoOpen(false)}
        >
          <div className="space-y-2 text-sm text-white/80">
            <p>Source: Global data. <br/> updated every 10 minutes</p>
          </div>
        </Sheet>
      )}
    </div>
  )
}

export default ModeControl
