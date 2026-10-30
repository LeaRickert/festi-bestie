interface FilterPanelProps {
  stages: string[]
  selectedStages: string[]
  onStagesChange: (stages: string[]) => void
}

// One chip per stage of the chosen day, each toggles on and off (export FR-1).
const FilterPanel = ({ stages, selectedStages, onStagesChange }: FilterPanelProps) => {
  const toggleStage = (stage: string) => {
    onStagesChange(selectedStages.includes(stage) ? selectedStages.filter((s) => s !== stage) : [...selectedStages, stage])
  }
  const allSelected = stages.every((stage) => selectedStages.includes(stage))

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-white/70 text-xs">Stages</span>
        <button
          type="button"
          onClick={() => onStagesChange(allSelected ? [] : stages)}
          className="text-white/70 hover:text-white text-xs transition-colors"
        >
          {allSelected ? 'Select none' : 'Select all'}
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {stages.map((stage) => {
          const selected = selectedStages.includes(stage)
          return (
            <button
              type="button"
              key={stage}
              aria-pressed={selected}
              onClick={() => toggleStage(stage)}
              className={`px-2.5 py-1 rounded-full border text-xs font-medium transition-colors ${
                selected ? 'bg-white border-white text-page' : 'border-white/30 text-white/80 hover:bg-white/10'
              }`}
            >
              {stage}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default FilterPanel
