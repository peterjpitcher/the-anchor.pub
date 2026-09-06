# Defect log

| ID | Type / severity / confidence | Evidence and root cause | Impact and sibling check | Fix / approval / verification |
|---|---|---|---|---|
| FF-001 | UX / medium / high | Live page offers radios while seats remain | Extra step and premature standing; checked free reassurance and policy | Removed choice, conditional standing; owner-requested local fix; browser seated and standing passed |
| FF-002 | UX / low / high | Live mobile details touch highlights and precede description | Reading order and spacing; desktop checked too | Moved description, added top margin; local fix; mobile visual and desktop DOM passed |
| FF-003 | UX / medium / high | Separate seats input permits more than six | Unnecessary field; mixed ticket flow checked | Picker only and six-ticket form limit; local fix; browser six-ticket payload and mixed-count tests passed |
| FF-004 | Booking / high / high | Live outside availability/create omit private hire | Garden double-booking possible; staff and website traced | Backend repair requires authorisation; no live booking test or mutation |
| FF-005 | Booking / high / high | Live v05 converts seated requests to standing | Unrequested standing; confirmation/payment wording checked | UI guards known capacity; atomic backend and SMS repair prepared separately for approval; local SQL and mocked management tests passed |
