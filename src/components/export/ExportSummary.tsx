import type { Act } from '../../hooks/useFestivalData'

interface ExportSummaryProps {
  day: string
  stages: string[]
  acts: Act[]
  ratings: Record<string, number>
}

const ExportSummary = ({ day, stages, acts, ratings }: ExportSummaryProps) => {
  const count = (minRating: number) => acts.filter((act) => (ratings[act.id] || 0) >= minRating).length
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-white">Preview Info</h3>
      <div className="bg-surface rounded-xl p-4 text-white/80 text-sm">
        <p><strong>Day:</strong> {day}</p>
        <p><strong>Stages:</strong> {stages.join(', ')}</p>
        <p><strong>Total Acts:</strong> {acts.length}</p>
        <p><strong>Interested Acts (3⭐+):</strong> {count(3)}</p>
        <p><strong>High Priority Acts (4⭐+):</strong> {count(4)}</p>
        <p><strong>Must See Acts (5⭐):</strong> {count(5)}</p>
      </div>
    </div>
  )
}

export default ExportSummary
