# Nations page follow-up

User requested booking recovery, date grouping and more keyword-led editorial below the games.

- [x] Reproduce the reported state in the actual open tab and compare it with the live feed.
- [x] Add immediate refresh and explicit full-page recovery for incompatible or unavailable data, keeping unavailable bookings closed.
- [x] Group filtered fixtures by London date with semantic headings and chronological ordering.
- [x] Add useful editorial below fixtures from the saved Planner keyword map and verified venue facts.
- [ ] Run focused regressions, full gates and browser journeys, then deploy and verify the exact production build.

Evidence: user tab 2076085415 held deployment dpl_74aDxiJhig1oQMt21XrDnxdphYXd, displayed refresh-failure and waiting-for-confirmation messages. Public feed returned all 24 approved/bookable. The old client schema only accepted full/from_opening coverage, while the new feed includes until_closing. Reloading the same tab restored 25 links (24 games plus featured game). No database changes are needed.

Additional owner requirements: add Nations Championship between Christmas and Airport parking until after Finals Weekend (29 November 2026); link games with confirmed Sunday food service to the Sunday roast menu across cards, highlights, booking context and calendars. Pub opening remains distinct from kitchen service.

Local browser checks passed for date sections, filters, immediate refresh, incompatible-feed recovery, correct top-bar order, Sunday versus weekday menu links, mobile/tablet/desktop widths and accessibility. London-date boundary tests prove the header link disappears on 30 November and does not recur in 2027.

Editorial keyword source: supplied Planner exports and the saved tournament keyword map. About 650 added words below fixtures cover autumn internationals, England's three November games, Finals Weekend, TV coverage, food and visiting. Official ITV and Allianz sources are linked beside the external claims. Three England import keys were verified against the live feed rather than the original seed proposal.
