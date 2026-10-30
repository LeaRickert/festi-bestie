// Festival dates as text (festivals FR-10). The DB dates are YYYY-MM-DD with no
// time zone, so they are read and formatted in UTC to keep the same day.

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function parts(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  return { year, month: MONTHS[month - 1], day }
}

// "November 7-9, 2025", "October 31 - November 2, 2025" or
// "December 30, 2025 - January 1, 2026". One day is "November 7, 2025".
export function formatDateRange(startDate: string, endDate: string): string {
  const start = parts(startDate)
  const end = parts(endDate)
  if (start.year !== end.year) {
    return `${start.month} ${start.day}, ${start.year} - ${end.month} ${end.day}, ${end.year}`
  }
  if (start.month !== end.month) {
    return `${start.month} ${start.day} - ${end.month} ${end.day}, ${end.year}`
  }
  if (start.day !== end.day) return `${start.month} ${start.day}-${end.day}, ${end.year}`
  return `${start.month} ${start.day}, ${start.year}`
}
