// The festival list (festivals FR-1, FR-8).

export interface StatusBadge {
  label: string
  className: string
}

const STATUS_BADGES: Record<string, StatusBadge> = {
  announced: { label: 'Announced', className: 'bg-gray-500/20 text-gray-300 border-gray-500/30' },
  lineup: { label: 'Lineup', className: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  stages: { label: 'Stages', className: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
  schedule: { label: 'Schedule', className: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  times: { label: 'Times', className: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  complete: { label: 'Complete', className: 'bg-green-500/20 text-green-300 border-green-500/30' },
}

export function statusBadge(status: string): StatusBadge {
  return STATUS_BADGES[status] ?? STATUS_BADGES.announced
}

// Today as YYYY-MM-DD in the time zone of the user, to compare with the DB dates.
export function localDateString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

interface DatedFestival {
  start_date: string
  end_date: string
}

// A festival is past the day after it ends.
export function isFestivalPast(endDate: string, today: string): boolean {
  return endDate < today
}

// Both lists are sorted by start date.
export function splitFestivals<T extends DatedFestival>(festivals: T[], today: string): { upcoming: T[]; past: T[] } {
  const sorted = [...festivals].sort((a, b) => a.start_date.localeCompare(b.start_date))
  return {
    upcoming: sorted.filter((festival) => !isFestivalPast(festival.end_date, today)),
    past: sorted.filter((festival) => isFestivalPast(festival.end_date, today)),
  }
}
