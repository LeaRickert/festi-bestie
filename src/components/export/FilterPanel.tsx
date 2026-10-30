import { Calendar, MapPin } from 'lucide-react'

interface FilterPanelProps {
  days: string[]
  selectedDay: string
  onDayChange: (day: string) => void
  stages: string[]
  selectedStages: string[]
  onStagesChange: (stages: string[]) => void
}

const FilterPanel = ({ days, selectedDay, onDayChange, stages, selectedStages, onStagesChange }: FilterPanelProps) => {
  const toggleStage = (stage: string) => {
    onStagesChange(selectedStages.includes(stage) ? selectedStages.filter((s) => s !== stage) : [...selectedStages, stage])
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-white/60" />
          <h3 className="text-lg font-semibold text-white">Select Day</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {days.map((day) => (
            <button
              type="button"
              key={day}
              onClick={() => onDayChange(day)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedDay === day ? 'bg-white text-page' : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {selectedDay && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-white/60" />
              <h3 className="text-lg font-semibold text-white">Select Stages</h3>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onStagesChange(stages)}
                className="px-3 py-1 text-sm bg-white/10 text-white/80 rounded hover:bg-white/20 transition-colors"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={() => onStagesChange([])}
                className="px-3 py-1 text-sm bg-white/10 text-white/80 rounded hover:bg-white/20 transition-colors"
              >
                Deselect All
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {stages.map((stage) => (
              <button
                type="button"
                key={stage}
                onClick={() => toggleStage(stage)}
                className={`p-3 rounded-lg font-medium transition-colors text-left ${
                  selectedStages.includes(stage) ? 'bg-white text-page' : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                {stage}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default FilterPanel
