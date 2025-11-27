import { DateTime } from 'luxon'

const data = {
  regularHours: {
    sunday: {
      opens: '12:00:00',
      closes: '22:00:00',
      kitchen: {
        opens: '12:00:00',
        closes: '17:00:00'
      },
      is_closed: false,
      is_kitchen_closed: false
    },
    monday: {
      opens: '16:00:00',
      closes: '22:00:00',
      kitchen: null,
      is_closed: false,
      is_kitchen_closed: false
    },
    tuesday: {
      opens: '16:00:00',
      closes: '22:00:00',
      kitchen: {
        opens: '18:00:00',
        closes: '21:00:00'
      },
      is_closed: false,
      is_kitchen_closed: false
    },
    wednesday: {
      opens: '16:00:00',
      closes: '22:00:00',
      kitchen: {
        opens: '18:00:00',
        closes: '21:00:00'
      },
      is_closed: false,
      is_kitchen_closed: false
    },
    thursday: {
      opens: '16:00:00',
      closes: '22:00:00',
      kitchen: {
        opens: '18:00:00',
        closes: '21:00:00'
      },
      is_closed: false,
      is_kitchen_closed: false
    },
    friday: {
      opens: '16:00:00',
      closes: '00:00:00',
      kitchen: {
        opens: '18:00:00',
        closes: '21:00:00'
      },
      is_closed: false,
      is_kitchen_closed: false
    },
    saturday: {
      opens: '12:00:00',
      closes: '00:00:00',
      kitchen: {
        opens: '13:00:00',
        closes: '19:00:00'
      },
      is_closed: false,
      is_kitchen_closed: false
    }
  },
  specialHours: [
    {
      date: '2025-11-01',
      opens: '12:00:00',
      closes: '00:00:00',
      kitchen: {
        opens: '13:00:00',
        closes: '16:00:00'
      },
      status: 'modified',
      note: 'Halloween Party from 8pm!'
    }
  ],
  currentStatus: {
    isOpen: false,
    kitchenOpen: false,
    closesIn: null,
    opensIn: '1 hour 24 minutes'
  },
  today: {
    date: '2025-10-31',
    dayName: 'friday',
    summary: 'Open 16:00:00 - 00:00:00, Kitchen 18:00:00 - 21:00:00',
    isSpecialHours: false,
    events: []
  }
}

function isKitchenOpen(kitchen) {
  return kitchen !== null && typeof kitchen === 'object' && 'opens' in kitchen && 'closes' in kitchen
}

function findNextKitchenOpening(data, options = {}) {
  const { includeToday = false, maxDays = 14 } = options
  const startOffset = includeToday ? 0 : 1

  for (let offset = startOffset; offset <= maxDays; offset += 1) {
    const { hours, dayName, date } = getHoursForDayOffset(data, offset)
    if (!hours || hours.is_closed) continue

    const kitchen = (hours).kitchen ?? null
    const kitchenClosedFlag = hours.is_kitchen_closed === true

    if (kitchenClosedFlag) continue
    if (!kitchen) continue
    if (!isKitchenOpen(kitchen)) continue

    return {
      offset,
      opens: kitchen.opens,
      closes: kitchen.closes,
      dayName,
      date: date.toJSDate()
    }
  }

  return null
}

function getHoursForDayOffset(data, offset) {
  const now = DateTime.fromISO('2025-10-31T22:30:00', { zone: 'Europe/London' })
  const target = now.plus({ days: offset })
  const dayNameLower = target.toFormat('cccc').toLowerCase()
  const dateStr = target.toFormat('yyyy-MM-dd')
  const specialHours = data.specialHours?.find(sh => sh.date === dateStr)
  const hours = specialHours || data.regularHours[dayNameLower]
  return {
    hours,
    dayName: target.toFormat('cccc'),
    date: target
  }
}

const nextOpening = findNextKitchenOpening(data)
console.log(nextOpening)
