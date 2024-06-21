// corefunctions.ts

/**
 * Get the suffix for a given day of the month.
 * @param {number} day - The day of the month.
 * @returns {string} - The suffix for the day.
 */
export function getDaySuffix(day: number): string {
  if (day > 3 && day < 21) return 'th' // All days between 4 and 20 end with 'th'
  switch (day % 10) {
    case 1:
      return 'st'
    case 2:
      return 'nd'
    case 3:
      return 'rd'
    default:
      return 'th'
  }
}

/**
 * Format a date string into a more readable format with a day suffix.
 * @param {string} dateStr - The date string to format.
 * @returns {string} - The formatted date string.
 */
export function formatDateFromString(dateStr: string): string {
  const date = new Date(dateStr)
  const day = date.getDate()
  const month = date.toLocaleString('default', { month: 'long' })
  const year = date.getFullYear()

  const daySuffix = getDaySuffix(day)

  return `${day}${daySuffix} ${month} ${year}`
}
