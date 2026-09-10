// Unified utilities for business hours and kitchen status
// Single source of truth matching Management API logic

import { formatTime12Hour } from '@/lib/time-utils';

// Match the actual API structure
type KitchenOpen = {
  opens: string;
  closes: string;
};

type KitchenClosed = {
  is_closed: true;
};

type KitchenStatus = KitchenOpen | KitchenClosed | null;

type ScheduleConfigEntry = {
  name?: string;
  starts_at?: string;
  ends_at?: string;
  capacity?: number;
  booking_type?: string;
  slot_type?: string;
};

type DayHours = {
  opens?: string | null;
  closes?: string | null;
  kitchen?: KitchenStatus;
  is_closed?: boolean;
  is_kitchen_closed?: boolean;
  schedule_config?: ScheduleConfigEntry[];
};

/** One kitchen service window. A day may have several: lunch, then dinner. */
export type KitchenWindow = {
  opens: string;
  closes: string;
};

/**
 * A weekly schedule that starts on a future date.
 *
 * The pub's opening hours are effective-dated in the management app, because
 * bookings are taken up to twelve months ahead and a schedule that changes on
 * the 1st must not retrospectively govern bookings taken for the 31st. The
 * `/business/hours` response therefore carries `regularHours` for the date it
 * was asked about (today, unless `?date=` says otherwise) plus every published
 * version whose start date has not yet arrived.
 */
export type UpcomingHoursVersion = {
  effectiveFrom: string;
  label?: string | null;
  hours: Record<string, DayHours>;
};

type SpecialDay = {
  date: string;
  opens?: string | null;
  closes?: string | null;
  kitchen?: KitchenStatus;
  status?: 'modified' | 'closed';
  note?: string;
  reason?: string;
  // The management API has always sent `status`, and sends `is_kitchen_closed`
  // on every entry. `is_closed` is newer, so both are treated as optional and
  // the code below still resolves correctly when only `status` arrives.
  is_closed?: boolean;
  is_kitchen_closed?: boolean;
  schedule_config?: ScheduleConfigEntry[];
};

/**
 * The weekly schedule in force on a given date.
 *
 * `regularHours` alone is only correct for the date the API resolved it for.
 * Painting the next seven days, or a booking date months out, from that one
 * week means a schedule change is invisible until the morning it starts, and
 * the site advertises the old times right up to the night before.
 *
 * ISO dates compare correctly as strings, so no parsing is needed here.
 */
export function resolveRegularHoursForDate(
  dateStr: string,
  regularHours: Record<string, DayHours>,
  upcomingVersions?: UpcomingHoursVersion[] | null
): Record<string, DayHours> {
  if (!upcomingVersions?.length) return regularHours;

  let winner: UpcomingHoursVersion | null = null;
  for (const version of upcomingVersions) {
    if (!version?.effectiveFrom || !version.hours) continue;
    if (version.effectiveFrom > dateStr) continue;
    if (!winner || version.effectiveFrom > winner.effectiveFrom) winner = version;
  }

  return winner ? winner.hours : regularHours;
}

/**
 * Get the effective hours for a specific date, accounting for special hours
 * Special hours completely override regular hours when present
 */
export function getEffectiveDayHours(
  dateStr: string,
  regularHours: Record<string, DayHours>,
  specialHours?: SpecialDay[],
  upcomingVersions?: UpcomingHoursVersion[] | null
): DayHours {
  const date = new Date(`${dateStr}T12:00:00`);
  const key = date.toLocaleDateString('en-GB', { weekday: 'long' }).toLowerCase(); // 'monday'..'sunday'
  const base = resolveRegularHoursForDate(dateStr, regularHours, upcomingVersions)[key] || {};
  const special = specialHours?.find(s => s.date === dateStr);

  if (!special) return base;

  // A special-hours entry is an exception for one date, so its closure flags
  // replace the regular day's rather than being combined with them. Reading the
  // regular day here meant an exception could not open anything the regular day
  // had shut: a bank holiday that opens a normally-closed day rendered as
  // closed, and a day with the bar open but the kitchen deliberately shut
  // inherited the wrong kitchen state from the weekday it happens to fall on.
  const venueClosed = special.is_closed ?? special.status === 'closed';

  // Prefer the exception's own kitchen flag. Still treat a missing kitchen
  // window as closed, because the venue being open says nothing about the
  // kitchen and an advertised service with no times is worse than none.
  const kitchenClosed =
    special.is_kitchen_closed === true || venueClosed || special.kitchen == null;

  // Times fall back to the regular day: an exception that only records a
  // closure or a note carries no times of its own.
  return {
    opens: special.opens ?? base.opens ?? null,
    closes: special.closes ?? base.closes ?? null,
    kitchen: special.kitchen ?? null,
    is_closed: venueClosed,
    is_kitchen_closed: kitchenClosed,
    // The exception's own sittings replace the regular day's, matching how the
    // availability route resolves them. An exception that lists none falls back
    // to the flattened kitchen window below rather than to another day's split.
    schedule_config: special.schedule_config ?? [],
  };
}

/** The pub never serves past the small hours, so a later 'end' is bad data, not a wrap. */
const LATEST_OVERNIGHT_END_MINUTES = 6 * 60;

function toMinutesOfDay(time: string): number | null {
  const match = /^(\d{1,2}):(\d{2})/.exec(time.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/**
 * Where a window ends, measured from the start of its own day.
 *
 * A service ending at or before 06:00 has run past midnight and is measured
 * into the next day. One ending before it starts at any other hour is malformed
 * rather than overnight: reading "21:00 to 16:00" as a nineteen-hour service
 * would advertise food all night.
 */
function kitchenEndMinutes(window: { opens: string; closes: string }): number | null {
  const opens = toMinutesOfDay(window.opens);
  const closes = toMinutesOfDay(window.closes);
  if (opens === null || closes === null) return null;
  if (closes > opens) return closes;
  if (closes <= LATEST_OVERNIGHT_END_MINUTES) return closes + 1440;
  return null;
}

function fromMinutesOfDay(total: number): string {
  const wrapped = ((total % 1440) + 1440) % 1440;
  const hours = Math.floor(wrapped / 60);
  const minutes = wrapped % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * The kitchen's real service windows for a day, in order.
 *
 * `kitchen` is a single flattened span, so a day with a lunch sitting and a
 * dinner sitting arrives as one 12:00-21:00 window even though the kitchen
 * shuts in between. `schedule_config` carries the actual sittings and the
 * booking availability route already enforces them: on a split day it marks
 * the gap `drinks_only`. Published hours have to be read the same way, or the
 * site advertises food at a time no food booking can be made.
 *
 * Falls back to the flattened window when a day lists no sittings, which is
 * still the common case for Saturdays and for most special-hours entries.
 */
export function getKitchenWindows(effective: DayHours): KitchenWindow[] {
  if (isVenueClosed(effective) || isKitchenClosed(effective)) return [];

  // The kitchen's own hours are a CEILING on its services, not merely a
  // fallback. A `regular` service gates drinks as well as food, so the
  // management app deliberately allows one to run past the kitchen close, and
  // live special-hours rows already do. The booking engine bounds food by both,
  // so reading the services alone would advertise food outside kitchen hours.
  // Absent kitchen hours mean no service at all, whatever services remain.
  const kitchen = effective.kitchen;
  const boundsOpenRaw =
    kitchen && typeof kitchen === 'object' && 'opens' in kitchen ? kitchen.opens : null;
  const boundsCloseRaw =
    kitchen && typeof kitchen === 'object' && 'closes' in kitchen ? kitchen.closes : null;
  const boundsOpen = toMinutesOfDay(boundsOpenRaw ?? '');
  const boundsClose =
    boundsOpenRaw && boundsCloseRaw
      ? kitchenEndMinutes({ opens: boundsOpenRaw, closes: boundsCloseRaw })
      : null;
  if (boundsOpen === null || boundsClose === null) return [];

  const sittings = (effective.schedule_config ?? [])
    .map((entry) => ({ opens: entry?.starts_at ?? '', closes: entry?.ends_at ?? '' }))
    .filter((window) => toMinutesOfDay(window.opens) !== null && kitchenEndMinutes(window) !== null)
    .sort((a, b) => (toMinutesOfDay(a.opens) ?? 0) - (toMinutesOfDay(b.opens) ?? 0));

  if (sittings.length === 0) {
    return [{ opens: boundsOpenRaw as string, closes: boundsCloseRaw as string }];
  }

  // Sittings that touch or overlap are one continuous service to a customer,
  // so they read as one window rather than "12pm-3pm, 3pm-9pm".
  const merged: KitchenWindow[] = [];
  for (const window of sittings) {
    const previous = merged[merged.length - 1];
    if (previous && (toMinutesOfDay(window.opens) ?? 0) <= (kitchenEndMinutes(previous) ?? 0)) {
      if ((kitchenEndMinutes(window) ?? 0) > (kitchenEndMinutes(previous) ?? 0)) {
        previous.closes = window.closes;
      }
      continue;
    }
    merged.push({ ...window });
  }

  // Clip to the kitchen's own hours. A service lying entirely outside them is
  // gating drinks, not food, so it is dropped.
  return merged.flatMap((window) => {
    const start = Math.max(toMinutesOfDay(window.opens) as number, boundsOpen);
    const end = Math.min(kitchenEndMinutes(window) as number, boundsClose);
    if (end <= start) return [];
    const unchanged =
      start === (toMinutesOfDay(window.opens) as number) &&
      end === (kitchenEndMinutes(window) as number);
    return [unchanged ? window : { opens: fromMinutesOfDay(start), closes: fromMinutesOfDay(end) }];
  });
}

/**
 * Check if kitchen is closed based on effective hours
 * Uses explicit flag first, then checks if kitchen is null or has is_closed flag
 */
export function isKitchenClosed(effective: DayHours): boolean {
  // Explicit flag is the source of truth
  if (typeof effective.is_kitchen_closed === 'boolean') {
    return effective.is_kitchen_closed;
  }
  
  // If no explicit flag, check if kitchen is null (means closed)
  if (effective.kitchen == null) return true;
  
  // Check if kitchen has is_closed flag (KitchenClosed type)
  if (typeof effective.kitchen === 'object' && 'is_closed' in effective.kitchen) {
    return effective.kitchen.is_closed === true;
  }

  // Some API responses provide opens/closes keys but leave them empty/null when closed
  if (
    typeof effective.kitchen === 'object' &&
    'opens' in effective.kitchen &&
    'closes' in effective.kitchen
  ) {
    const opens = (effective.kitchen as any).opens;
    const closes = (effective.kitchen as any).closes;
    
    if (!opens || !closes) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check if venue is closed
 */
export function isVenueClosed(effective: DayHours): boolean {
  return effective.is_closed === true;
}

/** The weekly schedule: this week's hours plus any published future versions. */
type WeeklyHours = {
  regularHours: Record<string, DayHours>;
  upcomingVersions?: UpcomingHoursVersion[] | null;
};

const WEEKDAY_INDEX: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

/**
 * The next London date (YYYY-MM-DD) falling on the given weekday, today included.
 *
 * The London calendar date is taken first, then stepped forward at UTC noon, so
 * neither the server's own zone nor a clock change can move it to another day.
 */
export function nextIsoDateForWeekday(day: string, now: Date = new Date()): string {
  const todayIso = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);

  const target = WEEKDAY_INDEX[day.toLowerCase()];
  if (target === undefined) return todayIso;

  const date = new Date(`${todayIso}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + ((target - date.getUTCDay() + 7) % 7));
  return date.toISOString().slice(0, 10);
}

/**
 * A weekday's kitchen sittings in the regular week, read on that weekday's NEXT
 * occurrence. The schedule is effective-dated: reading today's schedule for every
 * day described the outgoing hours on the eve of a change.
 */
export function getNextKitchenWindowsForWeekday(
  hours: WeeklyHours,
  day: string,
  now: Date = new Date()
): KitchenWindow[] {
  const key = day.toLowerCase();
  const dayHours = resolveRegularHoursForDate(
    nextIsoDateForWeekday(key, now),
    hours.regularHours,
    hours.upcomingVersions
  )[key];
  return dayHours ? getKitchenWindows(dayHours) : [];
}

/** "12pm-3pm & 4pm-9pm". */
function formatKitchenWindows(windows: KitchenWindow[]): string {
  return windows
    .map((window) => `${formatTime12Hour(window.opens)}-${formatTime12Hour(window.closes)}`)
    .join(' & ');
}

/**
 * The kitchen sittings every one of `days` shares, or null when any of them has
 * no sittings or they differ, so a caller never states one set of times for days
 * that do not share it. Days count as the same when their times read the same.
 */
export function getSharedKitchenWindows(
  hours: WeeklyHours,
  days: string[],
  now: Date = new Date()
): KitchenWindow[] | null {
  if (days.length === 0) return null;
  const perDay = days.map((day) => getNextKitchenWindowsForWeekday(hours, day, now));
  if (perDay.some((windows) => windows.length === 0)) return null;

  const first = formatKitchenWindows(perDay[0]);
  return perDay.every((windows) => formatKitchenWindows(windows) === first) ? perDay[0] : null;
}

const TUESDAY_TO_FRIDAY = ['tuesday', 'wednesday', 'thursday', 'friday'];

/**
 * The regular week's kitchen hours in one line, for FAQ answers:
 * "Tuesday to Friday 12pm-3pm & 4pm-9pm, Saturday 12pm-7pm, Sunday 1pm-6pm".
 *
 * Read as sittings, not one flattened span: a day serving lunch and then dinner
 * must not be described as open straight through the gap between them. Days
 * with no kitchen are left out.
 */
export function buildKitchenSchedule(hours: WeeklyHours, now: Date = new Date()): string {
  const schedule: Record<string, string> = {};

  const sharedWeekday = getSharedKitchenWindows(hours, TUESDAY_TO_FRIDAY, now);
  if (sharedWeekday) {
    schedule['Tuesday to Friday'] = formatKitchenWindows(sharedWeekday);
  } else {
    for (const day of TUESDAY_TO_FRIDAY) {
      const windows = getNextKitchenWindowsForWeekday(hours, day, now);
      if (windows.length > 0) {
        schedule[day.charAt(0).toUpperCase() + day.slice(1)] = formatKitchenWindows(windows);
      }
    }
  }

  const saturday = getNextKitchenWindowsForWeekday(hours, 'saturday', now);
  if (saturday.length > 0) schedule.Saturday = formatKitchenWindows(saturday);

  const sunday = getNextKitchenWindowsForWeekday(hours, 'sunday', now);
  if (sunday.length > 0) schedule.Sunday = formatKitchenWindows(sunday);

  return Object.entries(schedule)
    .map(([day, time]) => `${day} ${time}`)
    .join(', ');
}

/**
 * Normalize UK phone number to E.164 format
 * Handles various UK formats and ensures consistent +44 prefix
 */
export function normaliseUKPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('44')) return `+${digits}`;           // 44...
  if (digits.startsWith('0')) return `+44${digits.slice(1)}`; // 0...
  if (digits.length === 10) return `+44${digits}`;            // 7xxxxxxxxx
  return `+${digits}`;
}

/**
 * Convert time string with seconds to HH:mm format
 * "16:00:00" -> "16:00"
 */
export function formatTimeNoSeconds(time: string): string {
  if (!time) return '';
  const parts = time.split(':');
  return `${parts[0]}:${parts[1]}`;
}

/**
 * Parse time string to decimal hours for calculations
 * "16:30" or "16:30:00" -> 16.5
 */
export function parseTimeToDecimal(timeStr: string): number {
  const parts = timeStr.split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  return hours + minutes / 60;
}
