/**
 * The allergy box on the booking form, as the management app stores it (BK-052): one box, split on
 * commas, semicolons and new lines, trimmed, with blanks dropped, up to 20 entries of 100
 * characters, which is what POST /api/table-bookings accepts. The management app splits its own
 * staff box the same way (src/lib/table-bookings/allergy-words.ts), so both store one shape.
 */
export function parseAllergyList(text: string | null | undefined): string[] {
  if (typeof text !== 'string') return []
  return text
    .split(/[,;\n]/)
    .map((entry) => entry.trim().slice(0, 100))
    .filter((entry) => entry.length > 0)
    .slice(0, 20)
}
