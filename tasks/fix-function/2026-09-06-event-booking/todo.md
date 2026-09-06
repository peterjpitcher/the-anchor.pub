# Event booking changes

- [x] Check garden blocking and standing backend read-only.
- [x] Simplify quantity and seating selection and move event description.
- [x] Add capacity-change review and seating-aware retry key.
- [x] Verify browser, tests, lint, types and build.
- [x] Obtain deployment and exact production migration approval.
- [ ] Verify production deployment and apply the approved migration.

Complexity 4 after the standing-policy backend correction. Local only. Management migration 20260906134726_event_standing_after_seated_sold_out.sql is drafted, not applied. Detailed website evidence in discovery.md; management approval packet in its tasks/standing-ticket-policy/ directory. Garden blocking has been authorised as a separate fix.
