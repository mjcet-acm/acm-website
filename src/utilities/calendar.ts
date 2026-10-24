/**
 * Utilities to generate Google Calendar links and .ics calendar files
 */

function formatICSDate(date: Date): string {
  return date.toISOString().replace(/-|:|\.\d\d\d/g, '')
}

export function getGoogleCalendarUrl({
  title,
  description,
  venue,
  startDate,
  endDate,
}: {
  title: string
  description?: string
  venue?: string
  startDate: string
  endDate?: string | null
}): string {
  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : new Date(start.getTime() + 2 * 60 * 60 * 1000) // Default 2 hours

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${formatICSDate(start)}/${formatICSDate(end)}`,
    details: description || '',
    location: venue || 'MJCET, Hyderabad',
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function getICSContent({
  title,
  description,
  venue,
  startDate,
  endDate,
}: {
  title: string
  description?: string
  venue?: string
  startDate: string
  endDate?: string | null
}): string {
  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : new Date(start.getTime() + 2 * 60 * 60 * 1000)

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MJCET ACM Student Chapter//Events//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `SUMMARY:${title}`,
    `DESCRIPTION:${(description || '').replace(/\n/g, '\\n')}`,
    `LOCATION:${venue || 'MJCET, Hyderabad'}`,
    `DTSTART:${formatICSDate(start)}`,
    `DTEND:${formatICSDate(end)}`,
    `STATUS:CONFIRMED`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}
