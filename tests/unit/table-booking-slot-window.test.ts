import { pickSlotWindow, DEFAULT_SLOT_WINDOW_SIZE } from '@/lib/table-booking-slot-window'

function makeSlots(start: string, count: number) {
  const [h, m] = start.split(':').map((n) => Number.parseInt(n, 10))
  const startMin = h * 60 + m
  return Array.from({ length: count }, (_, i) => {
    const total = startMin + i * 30
    const hh = String(Math.floor(total / 60)).padStart(2, '0')
    const mm = String(total % 60).padStart(2, '0')
    return { time: `${hh}:${mm}`, available_capacity: 10 }
  })
}

describe('pickSlotWindow', () => {
  const day22 = makeSlots('12:00', 22) // 12:00..22:30

  it('centres on the anchor (19:00) and returns 7 slots 17:30..20:30', () => {
    const out = pickSlotWindow(day22, '19:00')
    expect(out).toHaveLength(7)
    expect(out[0].time).toBe('17:30')
    expect(out[6].time).toBe('20:30')
  })

  it('shifts the window earlier when the anchor is near close (22:00)', () => {
    const out = pickSlotWindow(day22, '22:00')
    expect(out[0].time).toBe('19:30')
    expect(out[6].time).toBe('22:30')
  })

  it('shifts the window later when the anchor is at open (12:00)', () => {
    const out = pickSlotWindow(day22, '12:00')
    expect(out[0].time).toBe('12:00')
    expect(out[6].time).toBe('15:00')
  })

  it('tie-breaks earlier at 19:15 (anchors 19:00 not 19:30)', () => {
    const out = pickSlotWindow(day22, '19:15')
    expect(out[0].time).toBe('17:30')
    expect(out[6].time).toBe('20:30')
  })

  it('uses the closer slot at 19:16 (anchors 19:30)', () => {
    const out = pickSlotWindow(day22, '19:16')
    expect(out[0].time).toBe('18:00')
    expect(out[6].time).toBe('21:00')
  })

  it('clamps to last 7 when anchor is past end (23:00)', () => {
    const out = pickSlotWindow(day22, '23:00')
    expect(out[0].time).toBe('19:30')
    expect(out[6].time).toBe('22:30')
  })

  it('returns all slots when array is shorter than size', () => {
    expect(pickSlotWindow(makeSlots('12:00', 5), '13:00')).toHaveLength(5)
  })

  it('returns all 7 when array is exactly size', () => {
    expect(pickSlotWindow(makeSlots('12:00', 7), '13:00')).toHaveLength(7)
  })

  it('returns 7 when array is one larger than size', () => {
    expect(pickSlotWindow(makeSlots('12:00', 8), '12:00')).toHaveLength(7)
  })

  it('returns empty for empty array', () => {
    expect(pickSlotWindow([], '12:00')).toEqual([])
  })

  it('returns first `size` slots when anchor is empty/invalid', () => {
    const out = pickSlotWindow(day22, '')
    expect(out).toHaveLength(7)
    expect(out[0].time).toBe('12:00')
  })

  it('respects custom size = 5', () => {
    const out = pickSlotWindow(day22, '19:00', 5)
    expect(out).toHaveLength(5)
    expect(out[0].time).toBe('18:00')
    expect(out[4].time).toBe('20:00')
  })

  it('returns [] for size = 0', () => {
    expect(pickSlotWindow(day22, '19:00', 0)).toEqual([])
  })

  it('preserves object identity', () => {
    const out = pickSlotWindow(day22, '19:00')
    expect(out[0]).toBe(day22[11]) // index 11 = 17:30
  })

  it('exports DEFAULT_SLOT_WINDOW_SIZE === 7', () => {
    expect(DEFAULT_SLOT_WINDOW_SIZE).toBe(7)
  })
})
