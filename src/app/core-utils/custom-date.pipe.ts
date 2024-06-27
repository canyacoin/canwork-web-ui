import { Pipe, PipeTransform } from '@angular/core'
import { formatDate } from '@angular/common'

function getDaySuffix(day: number): string {
  if (day > 3 && day < 21) return 'th' // Handle 11th to 13th
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

function formatCustomDate(value: any): string {
  if (!value) return value

  const date = new Date(value)
  const day = date.getDate()
  const month = formatDate(date, 'MMM', 'en-US')
  const year = date.getFullYear()
  const time = formatDate(date, 'hh:mm:ss a', 'en-US')

  const daySuffix = getDaySuffix(day)

  return `${day}${daySuffix} ${month}. ${year} | ${time}`
}

@Pipe({
  name: 'customDate',
})
export class CustomDatePipe implements PipeTransform {
  transform(value: any): any {
    return formatCustomDate(value)
  }
}
