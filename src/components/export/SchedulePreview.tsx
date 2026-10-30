import { useEffect, useRef } from 'react'
import { Calendar } from 'lucide-react'

// Shows the same HTML that the PNG is made from. buildScheduleHtml escapes all festival data.
const SchedulePreview = ({ html }: { html: string }) => {
  const canvas = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (canvas.current) canvas.current.innerHTML = html
  }, [html])

  return (
    <div className="bg-surface rounded-lg p-4 h-full">
      <h3 className="text-lg font-semibold text-white mb-4">Live Preview</h3>
      {html ? (
        <div ref={canvas} style={{ transform: 'scale(0.75)', transformOrigin: 'top left' }} />
      ) : (
        <div className="flex items-center justify-center h-64 text-white/60">
          <div className="text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Select a day and stages to see preview</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default SchedulePreview
