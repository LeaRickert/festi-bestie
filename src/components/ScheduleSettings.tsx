import { useState } from 'react'
import { Settings } from 'lucide-react'
import Sheet from './Sheet'

interface ScheduleSettingsProps {
  laterOnTop: boolean
  onLaterOnTopChange: (value: boolean) => void
}

// The gear icon button and the settings popup of the time grid (schedule-grid FR-7).
const ScheduleSettings = ({ laterOnTop, onLaterOnTopChange }: ScheduleSettingsProps) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Settings"
        className="flex items-center p-2 bg-white/10 text-white/80 rounded-md hover:bg-white/20 transition-colors"
      >
        <Settings className="h-4 w-4" />
      </button>

      {open && (
        <Sheet
          titleId="schedule-settings-title"
          header={
            <h2 id="schedule-settings-title" className="text-lg font-bold text-white">
              Settings
            </h2>
          }
          onClose={() => setOpen(false)}
        >
          <button
            type="button"
            role="switch"
            aria-checked={laterOnTop}
            onClick={() => onLaterOnTopChange(!laterOnTop)}
            className="flex min-h-11 w-full items-center justify-between gap-3 text-left text-sm text-white/80"
          >
            Later times on top
            <span className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${laterOnTop ? 'bg-white' : 'bg-white/20'}`}>
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full transition-all ${laterOnTop ? 'left-[18px] bg-page' : 'left-0.5 bg-white'}`}
              />
            </span>
          </button>
        </Sheet>
      )}
    </>
  )
}

export default ScheduleSettings
