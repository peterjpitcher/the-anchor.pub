import { DateTime } from 'luxon'

const hours = {
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
  ]
}

const londonNow = DateTime.fromISO('2025-10-31T22:30:00', { zone: 'Europe/London' })
const upcomingDays = Array.from({ length: 7 }, (_, index) => {
  const target = londonNow.plus({ days: index })
  return {
    key: target.toFormat('cccc').toLowerCase(),
    isoDate: target.toISODate(),
    label: target.toFormat('cccc'),
    isToday: index === 0
  }
})

const getSpecialHoursForDate = (isoDate) => {
  if (!isoDate || !hours.specialHours || hours.specialHours.length === 0) {
    return null
  }
  return hours.specialHours.find(sh => sh.date === isoDate) || null
}

const formatTime = (time) => {
  const [hoursPart, minutes] = time.split(':')
  const hour = parseInt(hoursPart)
  const ampm = hour >= 12 ? 'pm' : 'am'
  const displayHour = hour % 12 || 12
  return minutes === '00' ? `${displayHour}${ampm}` : `${displayHour}:${minutes}${ampm}`
}

for (const day of upcomingDays.slice(0, 3)) {
  const dayHours = hours.regularHours[day.key]
  const specialHours = getSpecialHoursForDate(day.isoDate)
  const displayHours = specialHours || dayHours
  const hasSpecialHours = !!specialHours

  console.log('Day', day.label, 'iso', day.isoDate, 'special?', hasSpecialHours)
  if (displayHours.is_closed) {
    console.log('  Closed')
  } else {
    console.log('  Bar:', formatTime(displayHours.opens), '-', formatTime(displayHours.closes))
    if (!hasSpecialHours && dayHours?.kitchen) {
      if ('opens' in dayHours.kitchen) {
        console.log('  Kitchen:', formatTime(dayHours.kitchen.opens), '-', formatTime(dayHours.kitchen.closes))
      } else if ('is_closed' in dayHours.kitchen) {
        console.log('  Kitchen: Closed')
      }
    }
  }
}
