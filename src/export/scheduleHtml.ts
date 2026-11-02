import type { Act } from '../hooks/useFestivalData'
import { ratingStyle } from '../utils/ratingStyle'
import { type GridRange, formatShortRange, getActPosition, getGridRange, getHourLines, hourLabel } from '../utils/scheduleUtils'

// The export image is a lock screen wallpaper, built as one HTML string. The
// live preview shows the same string, so the preview and the PNG always match.

// The page color of the theme (export FR-14).
export const IMAGE_BACKGROUND = '#051721'

// CSS size of the image and the device pixel ratio to draw it at (export FR-10).
export interface ImageSize {
  width: number
  height: number
  scale: number
}

// A desktop browser gets a common phone size, since the image is made for a phone.
const DESKTOP_SIZE: ImageSize = { width: 393, height: 852, scale: 3 }

export interface ScreenInfo {
  userAgent: string
  screenWidth: number
  screenHeight: number
  devicePixelRatio: number
}

export function isPhone(userAgent: string): boolean {
  return /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
}

export function getImageSize({ userAgent, screenWidth, screenHeight, devicePixelRatio }: ScreenInfo): ImageSize {
  if (!isPhone(userAgent) || !screenWidth || !screenHeight) return DESKTOP_SIZE
  // A wallpaper is portrait, also when the phone is turned sideways.
  return {
    width: Math.min(screenWidth, screenHeight),
    height: Math.max(screenWidth, screenHeight),
    scale: devicePixelRatio || 1,
  }
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

// The phone draws the clock and widgets over the top 25% (export FR-11).
export const CLOCK_ZONE = 0.25

const SIDE_PADDING = 6
const HEADER_HEIGHT = 20
const STAGE_ROW_HEIGHT = 20
const TIME_COLUMN_WIDTH = 12
const COLUMN_GAP = 3
// Room under the last hour line for its number.
const BOTTOM_LABEL_SPACE = 12
const MIN_ACT_HEIGHT = 12
const LINE_COLOR = 'rgba(255, 255, 255, 0.15)'

export interface ScheduleHtmlInput {
  festivalName: string
  // The header date, for example "Fri, Nov 6".
  dateLabel: string
  stages: string[]
  acts: Act[]
  ratings: Record<string, number>
  size: ImageSize
  // Outline the clock zone. Only the preview does this (export FR-12).
  preview?: boolean
}

type TimedAct = Act & { startTime: string; length: number }

function actHtml(act: TimedAct, rating: number, range: GridRange, pixelsPerHour: number): string {
  const style = ratingStyle(rating)
  const position = getActPosition(act, range, pixelsPerHour)
  const height = Math.max(position.height, MIN_ACT_HEIGHT)
  return `
    <div style="
      position: absolute;
      left: 0;
      width: 100%;
      top: ${position.top}px;
      height: ${height}px;
      padding: 1px 2px;
      border-radius: 3px;
      box-sizing: border-box;
      background: ${style.background};
      border: 1px solid ${style.borderColor};
      color: ${style.color};
      overflow: hidden;
      line-height: 1.15;
      overflow-wrap: anywhere;
    ">
      <div style="font-weight: bold; font-size: 7px;">${escapeHtml(act.artist)}</div>
      <div style="font-size: 6px; opacity: 0.9;">${formatShortRange(act.startTime, act.length)}</div>
    </div>`
}

export function buildScheduleHtml(input: ScheduleHtmlInput): string {
  const { festivalName, dateLabel, stages, acts, ratings, size, preview = false } = input
  const { width, height } = size

  // The grid fits the chosen acts (schedule-grid FR-5) and fills the image
  // from the stage names to the bottom, so the hour height follows from it.
  const range = getGridRange(acts) ?? { startMinutes: 0, endMinutes: 60 }
  const hours = (range.endMinutes - range.startMinutes) / 60
  const clockZoneHeight = Math.round(height * CLOCK_ZONE)
  const gridHeight = height - clockZoneHeight - HEADER_HEIGHT - STAGE_ROW_HEIGHT - BOTTOM_LABEL_SPACE
  const pixelsPerHour = gridHeight / hours
  const lineTop = (minutes: number) => ((minutes - range.startMinutes) * pixelsPerHour) / 60
  const hourLines = getHourLines(range)

  const lines = hourLines
    .map((minutes) => `<div style="position: absolute; left: 0; right: 0; top: ${lineTop(minutes)}px; height: 1px; background: ${LINE_COLOR};"></div>`)
    .join('')

  const labels = hourLines
    .map(
      (minutes) =>
        `<div style="position: absolute; left: 0; top: ${lineTop(minutes) + 2}px; font-size: 8px; line-height: 1; color: rgba(255, 255, 255, 0.6);">${hourLabel(minutes)}</div>`,
    )
    .join('')

  const stageNames = stages
    .map(
      (stage) => `
        <div style="
          flex: 1;
          min-width: 0;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          text-align: center;
          font-size: 8px;
          line-height: 9px;
          font-weight: 600;
          overflow: hidden;
        ">${escapeHtml(stage)}</div>`,
    )
    .join('')

  const stageColumns = stages
    .map((stage) => {
      const stageActs = acts.filter((act): act is TimedAct => act.stage === stage && Boolean(act.startTime) && Boolean(act.length))
      return `
        <div style="flex: 1; min-width: 0; position: relative; height: ${gridHeight}px;">
          ${stageActs.map((act) => actHtml(act, ratings[act.id] || 0, range, pixelsPerHour)).join('')}
        </div>`
    })
    .join('')

  const clockZoneOutline = preview
    ? `<div style="position: absolute; left: 4px; right: 4px; top: 4px; height: ${clockZoneHeight - 8}px; box-sizing: border-box; border: 1px dashed rgba(255, 255, 255, 0.25); border-radius: 8px;"></div>`
    : ''

  return `
    <div style="
      position: relative;
      width: ${width}px;
      height: ${height}px;
      box-sizing: border-box;
      padding: ${clockZoneHeight}px ${SIDE_PADDING}px ${BOTTOM_LABEL_SPACE}px;
      background: ${IMAGE_BACKGROUND};
      font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
      color: white;
      overflow: hidden;
    ">
      ${clockZoneOutline}
      <div style="height: ${HEADER_HEIGHT}px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: bold; white-space: nowrap; overflow: hidden;">
        ${escapeHtml(dateLabel)} - ${escapeHtml(festivalName)}
      </div>
      <div style="display: flex; gap: ${COLUMN_GAP}px; height: ${STAGE_ROW_HEIGHT}px; padding-bottom: 2px; box-sizing: border-box;">
        <div style="width: ${TIME_COLUMN_WIDTH}px; flex-shrink: 0;"></div>
        ${stageNames}
      </div>
      <div style="position: relative; display: flex; gap: ${COLUMN_GAP}px; height: ${gridHeight}px;">
        <div style="position: absolute; left: 0; right: 0; top: 0; bottom: 0;">${lines}</div>
        <div style="position: relative; width: ${TIME_COLUMN_WIDTH}px; flex-shrink: 0;">${labels}</div>
        ${stageColumns}
      </div>
    </div>
  `
}
