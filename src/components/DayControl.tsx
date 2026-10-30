import { useSearchParams } from 'react-router'

// The chosen day lives in the URL as ?day= (schedule-grid FR-2), so a reload
// keeps it. An unknown or missing day falls back to the first day.
export const useSelectedDay = (days: string[]): [string, (day: string) => void] => {
  const [searchParams, setSearchParams] = useSearchParams()
  const param = searchParams.get('day')
  const selectedDay = param && days.includes(param) ? param : (days[0] ?? '')

  const setSelectedDay = (day: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set('day', day)
        return next
      },
      { replace: true },
    )
  }

  return [selectedDay, setSelectedDay]
}

interface DayControlProps {
  days: string[]
  selectedDay: string
  onChange: (day: string) => void
}

// Full width and sticky at the top of the screen (schedule-grid FR-2).
const DayControl = ({ days, selectedDay, onChange }: DayControlProps) => (
  <div className="sticky top-0 z-30 -mx-4 px-4 py-2 bg-page">
    <div className="flex gap-1 bg-surface rounded-lg p-1" role="tablist" aria-label="Day">
      {days.map((day) => (
        <button
          type="button"
          role="tab"
          aria-selected={selectedDay === day}
          key={day}
          onClick={() => onChange(day)}
          className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${
            selectedDay === day ? 'bg-white text-page' : 'text-white/80 hover:bg-white/10'
          }`}
        >
          {day}
        </button>
      ))}
    </div>
  </div>
)

export default DayControl
