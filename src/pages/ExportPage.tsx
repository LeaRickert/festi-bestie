import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ArrowLeft, Download } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useFestivalData } from '../hooks/useFestivalData'
import { getUniqueDays, getUniqueStages, filterActsByDay } from '../utils/scheduleUtils'
import { buildScheduleHtml, canExport, exportFileName, filterExportActs, getExportLayout } from '../export/scheduleHtml'
import { downloadSchedulePng } from '../export/downloadPng'
import FilterPanel from '../components/export/FilterPanel'
import ExportSummary from '../components/export/ExportSummary'
import SchedulePreview from '../components/export/SchedulePreview'

const PAGE_BACKGROUND = 'min-h-screen bg-page flex items-center justify-center'

const ExportPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { festival, acts, ratings, loading, error, retry } = useFestivalData(id ?? null, user)

  const [selectedDay, setSelectedDay] = useState('')
  const [selectedStages, setSelectedStages] = useState<string[]>([])
  const [isExporting, setIsExporting] = useState(false)

  const days = useMemo(() => getUniqueDays(acts), [acts])
  const dayStages = useMemo(() => getUniqueStages(filterActsByDay(acts, selectedDay)), [acts, selectedDay])
  const filteredActs = useMemo(() => filterExportActs(acts, selectedDay, selectedStages), [acts, selectedDay, selectedStages])

  useEffect(() => {
    if (days.length > 0 && !selectedDay) setSelectedDay(days[0])
  }, [days, selectedDay])

  // A new day starts with all of its stages selected.
  useEffect(() => {
    if (dayStages.length > 0) setSelectedStages(dayStages)
  }, [dayStages])

  const exportable = canExport(selectedDay, selectedStages)
  const html = useMemo(() => {
    if (!festival || !exportable) return ''
    return buildScheduleHtml({
      festivalName: festival.name,
      day: selectedDay,
      stages: selectedStages,
      acts: filteredActs,
      ratings,
      layout: getExportLayout(navigator.userAgent, window.innerWidth),
      generatedOn: new Date().toLocaleDateString(),
    })
  }, [festival, exportable, selectedDay, selectedStages, filteredActs, ratings])

  const handleExport = async () => {
    if (!festival || !exportable) return
    setIsExporting(true)
    try {
      await downloadSchedulePng(html, exportFileName(festival.name, selectedDay))
    } catch (err) {
      console.error('Error generating schedule image:', err)
      alert('Error generating schedule. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  if (loading) {
    return (
      <div className={PAGE_BACKGROUND}>
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${PAGE_BACKGROUND} flex-col gap-3`}>
        <div className="text-red-400 text-sm">Could not load the festival: {error}</div>
        <button type="button" onClick={retry} className="px-3 py-1.5 bg-white/10 text-white/80 rounded-md hover:bg-white/20 transition-colors text-sm">
          Try again
        </button>
      </div>
    )
  }

  if (!festival) {
    return (
      <div className={PAGE_BACKGROUND}>
        <div className="text-white text-xl">Festival not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-page">
      <div className="bg-page border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate(`/festival/${id}`)}
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                Back to Festival
              </button>
              <div className="h-6 w-px bg-white/20" />
              <h1 className="text-xl font-bold text-white">Export Schedule</h1>
            </div>
            <button
              type="button"
              onClick={handleExport}
              disabled={!exportable || isExporting}
              className="px-6 py-2 bg-white text-page rounded-lg font-medium hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-page/30 border-t-page rounded-full animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export Schedule
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)]">
          <div className="w-full lg:w-1/2 overflow-y-auto space-y-6">
            <FilterPanel
              days={days}
              selectedDay={selectedDay}
              onDayChange={setSelectedDay}
              stages={dayStages}
              selectedStages={selectedStages}
              onStagesChange={setSelectedStages}
            />
            {exportable && <ExportSummary day={selectedDay} stages={selectedStages} acts={filteredActs} ratings={ratings} />}
          </div>
          <div className="w-full lg:w-1/2 overflow-y-auto">
            <SchedulePreview html={html} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExportPage
