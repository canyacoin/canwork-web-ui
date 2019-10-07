import { Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root',
})
export class DatesService {
  constructor() {}

  timestampToDate(timestamp) {
    const date = new Date(parseInt(timestamp, 10))
    const format = this.formatDate(date)
    return format
  }

  stringToDate(string) {
    const date = new Date(string)
    const format = this.formatDate(date)
    return format
  }

  formatDate(date: Date) {
    const formatted = date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    return formatted
  }

  timeStampToDatetime(timestamp) {
    const date = new Date(parseInt(timestamp, 10))
    const format = this.formatDateWithTime(date)
    return format
  }

  formatDateWithTime(date: Date) {
    const formattedDate = date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    const formattedTime = date.toLocaleTimeString()
    const formatted = formattedDate + ' ' + formattedTime
    return formatted
  }
}
