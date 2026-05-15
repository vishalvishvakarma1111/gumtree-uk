export type DatePosted = 'today' | 'week' | 'month' | 'last_month' | 'old'

export const DATE_POSTED_OPTIONS: { label: string; value: DatePosted }[] = [
  { label: 'Today', value: 'today' },
  { label: 'This week', value: 'week' },
  { label: 'This month', value: 'month' },
  { label: 'Last month', value: 'last_month' },
  { label: 'Old', value: 'old' },
]

const DEFAULT_TZ = 'Europe/London'

function safeTz(tz: string | undefined): string {
  if (!tz) return DEFAULT_TZ
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz })
    return tz
  } catch {
    return DEFAULT_TZ
  }
}

interface ZonedParts {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

function getZonedParts(date: Date, tz: string): ZonedParts {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  const parts = fmt.formatToParts(date)
  const get = (t: string) => Number(parts.find(p => p.type === t)?.value ?? '0')
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
    second: get('second'),
  }
}

function zonedWallToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  tz: string,
): Date {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, 0)
  const parts = getZonedParts(new Date(utcGuess), tz)
  const wallAsUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  )
  const offset = wallAsUtc - utcGuess
  return new Date(utcGuess - offset)
}

function startOfDay(now: Date, tz: string): Date {
  const p = getZonedParts(now, tz)
  return zonedWallToUtc(p.year, p.month, p.day, 0, 0, tz)
}

function startOfWeekMonday(now: Date, tz: string): Date {
  const todayStart = startOfDay(now, tz)
  const dow = new Date(todayStart).getUTCDay()
  const daysSinceMonday = (dow + 6) % 7
  return new Date(todayStart.getTime() - daysSinceMonday * 86400000)
}

function startOfMonth(now: Date, tz: string): Date {
  const p = getZonedParts(now, tz)
  return zonedWallToUtc(p.year, p.month, 1, 0, 0, tz)
}

function startOfLastMonth(now: Date, tz: string): Date {
  const p = getZonedParts(now, tz)
  const prevMonth = p.month === 1 ? 12 : p.month - 1
  const prevYear = p.month === 1 ? p.year - 1 : p.year
  return zonedWallToUtc(prevYear, prevMonth, 1, 0, 0, tz)
}

export function datePostedRange(
  posted: string | undefined,
  tzInput: string | undefined,
  now: Date = new Date(),
): { gte?: string; lt?: string } | null {
  if (!posted) return null
  const tz = safeTz(tzInput)

  switch (posted) {
    case 'today':
      return { gte: startOfDay(now, tz).toISOString() }
    case 'week':
      return { gte: startOfWeekMonday(now, tz).toISOString() }
    case 'month':
      return { gte: startOfMonth(now, tz).toISOString() }
    case 'last_month':
      return {
        gte: startOfLastMonth(now, tz).toISOString(),
        lt: startOfMonth(now, tz).toISOString(),
      }
    case 'old':
      return { lt: startOfLastMonth(now, tz).toISOString() }
    default:
      return null
  }
}
