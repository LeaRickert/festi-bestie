import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, Download } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useFestivalData } from '../hooks/useFestivalData'
import { getUniqueDays, getUniqueStages, filterActsByDay } from '../utils/scheduleUtils'
import { buildScheduleHtml, canExport, exportFileName, filterExportActs, getImageSize, isPhone } from '../export/scheduleHtml'
import { festivalDayDate, formatLongDay } from '../utils/dateUtils'
import { downloadFile, renderSchedulePng } from '../export/downloadPng'
import DayControl, { useSelectedDay } from '../components/DayControl'
import FilterPanel from '../components/export/FilterPanel'
import SaveImageSheet from '../components/export/SaveImageSheet'
import SchedulePreview from '../components/export/SchedulePreview'
import {posthog} from "../posthog";
import {posthogLogger} from "../posthogLogger";

const PAGE_BACKGROUND = 'min-h-screen bg-page flex items-center justify-center'

const ExportPage = () => {
  const { slug } = useParams()
  const { user } = useAuth()
  const { festival, acts, ratings, loading, error, retry } = useFestivalData(slug ?? null, user)

  const [selectedStages, setSelectedStages] = useState<string[]>([])
  const [isExporting, setIsExporting] = useState(false)
  const [imageToSave, setImageToSave] = useState<File | null>(null)

  const days = useMemo(() => getUniqueDays(acts), [acts])
  // The same ?day= as the festival page, so both show the same day (schedule-grid FR-2).
  const [selectedDay, setSelectedDay] = useSelectedDay(days)
  const dayStages = useMemo(() => getUniqueStages(filterActsByDay(acts, selectedDay)), [acts, selectedDay])
  const filteredActs = useMemo(() => filterExportActs(acts, selectedDay, selectedStages), [acts, selectedDay, selectedStages])

  // A new day starts with all of its stages selected.
  useEffect(() => {
    if (dayStages.length > 0) setSelectedStages(dayStages)
  }, [dayStages])

  const exportable = canExport(selectedDay, selectedStages)
  const size = useMemo(
    () =>
      getImageSize({
        userAgent: navigator.userAgent,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        devicePixelRatio: window.devicePixelRatio,
      }),
    [],
  )

  // The image and its preview differ only in the clock zone outline (export FR-12).
  const buildHtml = (preview: boolean) => {
    if (!festival || !exportable) return ''
    const date = festivalDayDate(festival.start_date, festival.end_date, selectedDay)
    return buildScheduleHtml({
      festivalName: festival.name,
      dateLabel: date ? formatLongDay(date) : selectedDay,
      stages: selectedStages,
      acts: filteredActs,
      ratings,
      size,
      preview,
    })
  }

  const handleExport = async () => {
    if (!festival || !exportable) return
    setIsExporting(true)
    try {
      const file = await renderSchedulePng(buildHtml(false), size, exportFileName(festival.name, selectedDay))
      // A phone saves to its gallery from the sheet (export FR-15).
      if (isPhone(navigator.userAgent)) setImageToSave(file)
      else downloadFile(file)
      posthog?.capture('schedule_exported', {
        festival_id: festival.id,
        selected_day: selectedDay,
        selected_stage_count: selectedStages.length,
        act_count: filteredActs.length,
      })
      posthogLogger.info('schedule export completed', {
        festival_id: festival.id,
        selected_day: selectedDay,
        selected_stage_count: selectedStages.length,
        act_count: filteredActs.length,
      })
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
      <header className="border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <Link
            to={`/festival/${slug}?day=${encodeURIComponent(selectedDay)}`}
            className="flex items-center text-white/70 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back
          </Link>
          <button
            type="button"
            onClick={handleExport}
            disabled={!exportable || isExporting}
            className="flex items-center px-3 py-1.5 bg-white text-page rounded-md font-medium hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {isExporting ? (
              <div className="h-4 w-4 mr-1.5 border-2 border-page/30 border-t-page rounded-full animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-1.5" />
            )}
            Download
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 pb-6">
        <DayControl days={days} selectedDay={selectedDay} onChange={setSelectedDay} />
        <div className="max-w-md mx-auto space-y-4 pt-2">
          <FilterPanel stages={dayStages} selectedStages={selectedStages} onStagesChange={setSelectedStages} />
          <SchedulePreview html={buildHtml(true)} size={size} />
        </div>
      </div>

      {imageToSave && <SaveImageSheet file={imageToSave} onClose={() => setImageToSave(null)} />}
    </div>
  )
}

export default ExportPage
