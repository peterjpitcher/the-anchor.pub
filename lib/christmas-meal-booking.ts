/**
 * A Christmas meal for up to the private-hire threshold books online as a table booking (BK-061,
 * owner decision D22). /book-table asks the Christmas question, takes the £10 per person deposit
 * and collects each guest's courses, so a party of 4 to 20 gets an instant booking instead of an
 * enquiry that a person has to re-key as private hire on different terms. Bigger groups are still
 * an enquiry: more than 20 is a private booking (SSOT section 7).
 *
 * A blank party size counts as "books online": the booking form asks for the number itself.
 */
export function christmasMealBooksOnline(partySizeText: string, privateHireThreshold: number): boolean {
  const guests = Number.parseInt(partySizeText, 10)
  return !(Number.isFinite(guests) && guests > privateHireThreshold)
}

/** /book-table with whatever the guest has already told us, so they do not type it twice. */
export function christmasTableBookingHref(input: { date?: string; partySize?: string; time?: string }): string {
  const params = new URLSearchParams()
  if (input.date && /^\d{4}-\d{2}-\d{2}$/.test(input.date)) params.set('date', input.date)
  const guests = Number.parseInt(input.partySize ?? '', 10)
  if (Number.isFinite(guests) && guests >= 1 && guests <= 20) params.set('party_size', String(guests))
  if (input.time && /^\d{2}:\d{2}$/.test(input.time)) params.set('time', input.time)
  const query = params.toString()
  return query ? `/book-table?${query}` : '/book-table'
}
