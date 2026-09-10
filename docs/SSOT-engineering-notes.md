# SSOT engineering notes

The technical detail behind rules in `docs/SSOT.md`: how the management API behaves, why a database row is kept, how to resolve a value in code. It lives here so the SSOT stays readable by the people who write copy. **The SSOT is still the authority on what is true; this file only explains the mechanics.**

## Kitchen hours: resolving a special day against the regular week

Referenced by SSOT §3.

A date has either an override in `special_hours`, or no override. The kitchen value for that date is:

| The date has | Its kitchen value | Resolve to |
|---|---|---|
| No override | n/a | The regular week's kitchen hours for that weekday |
| An override with kitchen hours | e.g. `12:00` to `18:00` | The override's hours |
| An override with the kitchen closed | `kitchen: null`, `is_kitchen_closed: true` | **Closed.** Do not fall back |
| An override with the pub closed | `is_closed: true` | Closed, pub and kitchen |

The earlier SSOT advice was to use `??` rather than `||`. That is not enough. `special.kitchen ?? regular.kitchen` falls back when `special.kitchen` is `null`, and `null` is exactly the value that means the kitchen is closed that day, so a deliberate closure turns back into regular hours. `||` has the same fault and more. Decide on whether the override **exists**, not on whether its value is truthy:

```ts
const kitchen = override ? override.kitchen : regular.kitchen // override.kitchen may be null: that means closed
```

Test all four rows above. The third is the one that has broken before.

## The 90-day special-hours horizon

Referenced by SSOT §7.

`GET /business/hours` only returns special hours for roughly the next 90 days. A date beyond that window shows no override and an empty `planning.nextClosure`, which looks exactly like a closure nobody entered. On 8 September 2026 the window reached only 7 December, so all three festive closures were invisible through the API while being correctly set. **Query the database directly before concluding an override is missing.**

## Why retired Sunday roast rows are deactivated, not deleted

Referenced by SSOT §4.

`table_booking_items` has foreign keys into `sunday_lunch_menu_items`. Historical bookings still need their menu rows to resolve, so a retired dish is set `is_active = false` rather than removed. Every reader must filter on `is_active`; an inactive row is not a menu item.

## Two menu tables

Referenced by SSOT §4 and §15.

The Sunday roast lives in two tables that are edited separately and drift apart:

- `menu_dishes` feeds the website, through the menu API.
- `sunday_lunch_menu_items` feeds the booking and pre-order system.

A change to one does not reach the other. On 9 September 2026 both carried the same wrong Wellington description, and only one of them had the dish's dietary flag. When a dish changes, update both, then read both back.

## Christmas dishes

Referenced by SSOT §7.

The Christmas dish list lives on the Christmas booking period in the management database and reaches the website through `/table-bookings/periods`, which is the same source the booking form builds a pre-order from. Publish what it returns. If it returns no menu, render nothing rather than a placeholder.

## Dietary flags are machine tokens

Referenced by SSOT §5.

`menu_dishes.dietary_flags` values such as `gluten_free`, the `gluten-free` parameter on the dietary-menu endpoint, and the `gluten_free` GTM filter value are identifiers, not copy. Renaming them breaks the website filter and the API contract. The visible label is still NGCI.

## Checking copy automatically

Referenced by SSOT §1 and §14.

The management app encodes the checkable half of SSOT §1 and §14 in `src/lib/copy/house-style.ts`. A claim §14 bans outright is an error, and `scheduleCampaign` refuses to schedule an email carrying one; voice issues are warnings, shown in the campaign screen and never blocking. `npx tsx scripts/audit-house-style.ts` runs the same rules over both menu tables, the events and every campaign, and `--all` includes retired rows. When §1 or §14 changes, change that file to match.
