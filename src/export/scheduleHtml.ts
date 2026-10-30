import type { Act } from '../hooks/useFestivalData'
import { calculateEndTime, formatTime, generateTimeSlots, timeToMinutes } from '../utils/scheduleUtils'

// The export image is built as one HTML string. The live preview shows the
// same string, so the preview and the PNG always match.

export interface ExportLayout {
  width: number
  height: number
  fontSize: string
  padding: string
  timeColumnWidth: string
  compact: boolean
}

const PHONE: ExportLayout = { width: 393, height: 852, fontSize: '11px', padding: '15px', timeColumnWidth: '20px', compact: true }
const TABLET: ExportLayout = { width: 768, height: 1024, fontSize: '14px', padding: '30px', timeColumnWidth: '35px', compact: false }
// A desktop browser gets the phone size, since the image is made for a phone.
const DESKTOP: ExportLayout = { ...PHONE, compact: false }

export function getExportLayout(userAgent: string, innerWidth: number): ExportLayout {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
  const isTablet = /iPad|Android/i.test(userAgent) && innerWidth >= 768
  if (isTablet) return TABLET
  return isMobile ? PHONE : DESKTOP
}

export function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export function exportFileName(festivalName: string, day: string): string {
  return `${festivalName.replace(/\s+/g, '_')}_${day.replace(/\s+/g, '_')}_schedule.png`
}

export function canExport(day: string, stages: string[]): boolean {
  return day !== '' && stages.length > 0
}

export function filterExportActs(acts: Act[], day: string, stages: string[]): Act[] {
  return acts.filter((act) => act.day === day && act.stage !== null && stages.includes(act.stage))
}

export interface ActStyle {
  background: string
  border: string
  boxShadow: string
  fontWeight: string
}

// The higher the rating, the louder the act.
export function ratingStyle(rating: number): ActStyle {
  if (rating >= 5) {
    return {
      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
      border: '2px solid #ff4757',
      boxShadow: '0 4px 20px rgba(255, 71, 87, 0.4)',
      fontWeight: 'bold',
    }
  }
  if (rating >= 4) {
    return {
      background: 'linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)',
      border: '2px solid #ff9ff3',
      boxShadow: '0 2px 10px rgba(255, 159, 243, 0.3)',
      fontWeight: '600',
    }
  }
  if (rating >= 3) {
    return {
      background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
      border: '2px solid #74b9ff',
      boxShadow: '0 2px 8px rgba(116, 185, 255, 0.3)',
      fontWeight: '600',
    }
  }
  return {
    background: 'rgba(139, 92, 246, 0.2)',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    boxShadow: 'none',
    fontWeight: 'normal',
  }
}

const GRID_START_MINUTES = 13 * 60
const MIN_ACT_HEIGHT = 20

// Minutes from the grid start (1 PM). Times after midnight count past 24:00.
function minutesFromGridStart(startTime: string): number {
  const minutes = timeToMinutes(startTime)
  const afterMidnight = minutes < 6 * 60 ? minutes + 24 * 60 : minutes
  return Math.max(0, afterMidnight - GRID_START_MINUTES)
}

export interface ScheduleHtmlInput {
  festivalName: string
  day: string
  stages: string[]
  acts: Act[]
  ratings: Record<string, number>
  layout: ExportLayout
  generatedOn: string
}

function actHtml(act: Act & { startTime: string; length: number }, rating: number, layout: ExportLayout, rowHeight: number): string {
  const { compact } = layout
  const style = ratingStyle(rating)
  const top = (minutesFromGridStart(act.startTime) * rowHeight) / 60
  const height = Math.max((act.length * rowHeight) / 60, MIN_ACT_HEIGHT)
  return `
    <div style="
      position: absolute;
      left: 0;
      width: 100%;
      top: ${top}px;
      height: ${height}px;
      padding: ${compact ? '2px 3px' : '4px 6px'};
      border-radius: ${compact ? '3px' : '4px'};
      font-size: ${compact ? '7px' : '9px'};
      font-weight: ${style.fontWeight};
      background: ${style.background};
      border: ${style.border};
      box-shadow: ${style.boxShadow};
      color: white;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
      overflow: visible;
      white-space: normal;
      line-height: 1.1;
      word-wrap: break-word;
      z-index: 10;
    ">
      <div style="display: flex; flex-direction: column; gap: 1px;">
        <div style="font-weight: bold; font-size: ${compact ? '7px' : '8px'};">${escapeHtml(act.artist)}</div>
        <div style="font-size: ${compact ? '6px' : '7px'}; opacity: 0.9;">${formatTime(act.startTime)} - ${calculateEndTime(act.startTime, act.length)}</div>
      </div>
    </div>
  `
}

export function buildScheduleHtml(input: ScheduleHtmlInput): string {
  const { festivalName, day, stages, acts, ratings, layout, generatedOn } = input
  const { compact, width, height, fontSize, padding, timeColumnWidth } = layout
  const rowHeight = compact ? 50 : 60
  const slots = generateTimeSlots()

  const stageHeaders = stages
    .map(
      (stage) => `
        <div style="
          flex: 1;
          padding: ${compact ? '8px' : '12px'};
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          font-weight: bold;
          text-align: center;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%);
          font-size: ${compact ? '10px' : '12px'};
        ">${escapeHtml(stage)}</div>`,
    )
    .join('')

  const timeCells = slots
    .map(
      (slot) => `
        <div style="
          height: ${rowHeight}px;
          box-sizing: border-box;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: ${compact ? '4px 1px 2px 2px' : '6px 2px 3px 3px'};
          font-weight: 600;
          font-size: ${compact ? '8px' : '10px'};
        ">${slot}</div>`,
    )
    .join('')

  const hourLines = slots
    .map(
      (_, index) => `
        <div style="position: absolute; left: 0; right: 0; top: ${index * rowHeight}px; height: ${rowHeight}px; box-sizing: border-box; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
          <div style="position: absolute; left: 0; right: 0; top: 50%; height: 1px; background: rgba(255, 255, 255, 0.05);"></div>
        </div>`,
    )
    .join('')

  const stageColumns = stages
    .map((stage) => {
      const stageActs = acts.filter(
        (act): act is Act & { startTime: string; length: number } =>
          act.stage === stage && Boolean(act.startTime) && Boolean(act.length),
      )
      return `
        <div style="flex: 1; position: relative; height: ${slots.length * rowHeight}px; border-right: 1px solid rgba(255, 255, 255, 0.1);">
          ${hourLines}
          ${stageActs.map((act) => actHtml(act, ratings[act.id] || 0, layout, rowHeight)).join('')}
        </div>`
    })
    .join('')

  return `
    <div style="
      width: ${width}px;
      height: ${height}px;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      padding: ${padding};
      font-family: 'Inter', sans-serif;
      color: white;
      border-radius: 12px;
      overflow: hidden;
      margin: 0 auto;
    ">
      <div style="margin-bottom: 15px;">
        <h1 style="font-size: ${compact ? '16px' : '18px'}; font-weight: bold; margin-bottom: 8px; text-align: center;">
          ${escapeHtml(day.toUpperCase())} - ${escapeHtml(festivalName)}
        </h1>
        <div style="text-align: center; font-size: ${compact ? '10px' : '12px'}; opacity: 0.8; margin-bottom: 15px;">
          Generated on ${escapeHtml(generatedOn)} • ${stages.length} stages
        </div>
      </div>

      <div style="
        background: rgba(255, 255, 255, 0.05);
        border-radius: ${compact ? '8px' : '12px'};
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.1);
        font-size: ${fontSize};
      ">
        <div style="display: flex; border-bottom: 2px solid rgba(255, 255, 255, 0.2); background: rgba(255, 255, 255, 0.1);">
          <div style="width: ${timeColumnWidth}; padding: ${compact ? '4px' : '8px'}; border-right: 1px solid rgba(255, 255, 255, 0.1);"></div>
          ${stageHeaders}
        </div>
        <div style="display: flex;">
          <div style="width: ${timeColumnWidth}; border-right: 1px solid rgba(255, 255, 255, 0.1); background: rgba(255, 255, 255, 0.05);">
            ${timeCells}
          </div>
          ${stageColumns}
        </div>
      </div>
    </div>
  `
}
