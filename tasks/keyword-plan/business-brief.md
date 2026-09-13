# Business brief: The Anchor, hosted event nights

Written 11 September 2026 for the first v2.1 keyword run (targeted: the event pages). Owned by
the owner; the skill reads it at every plan. Facts come from `docs/SSOT.md` section 10 and the
management app. This repository is public, so no takings, booking counts or customer data are
recorded here; those live in the owner's report outside the repository.

## Outcome wanted

More people at the three hosted game nights: Quiz Night, Cash Bingo and Music Bingo. The owner
said on 11 September 2026 that these nights are not in growth and will be stopped unless
attendance grows.

How it is measured, in order of trust:

1. Event-night takings against the same weekday's non-event nights (the management app's daily
   cash-up), because walk-ins never appear in the booking data.
2. Booked seats per night in the management app, by booking source (website, SMS reply, staff).
3. Search Console clicks to the event pages, which are a small share of how people find these
   nights. Search is a supporting channel here, not the main one.

## Priority services, in order

1. Quiz Night: monthly, dates vary, usually a Wednesday. Arrive from 6:30pm, start 7pm, aims to
   finish 9:30pm. £3 a player, teams of up to 6. Phone-free.
2. Cash Bingo: monthly, dates vary, currently Wednesdays. Arrive by 6:30pm, first game 7pm.
   £10 a book, cash only. 18+ to play, supervised under-18s welcome to attend.
3. Music Bingo: dates vary, currently Fridays. Start 7pm, £5 a player unless the event record
   says otherwise. Hosted by Nikki Manfadge. Never claim it sells out.
4. `/whats-on`, the hub listing every upcoming night.

Out of scope for this run: karaoke (occasional), tasting nights, party nights, live sport.

## Capacity constraints

Each game night seats 60 (mirrored from the management app on 6 September 2026; page code reads
capacity from the API). There is spare capacity on every format. The nights run on quiet
midweek and Friday evenings; the owner wants those evenings fuller.

## Geography served

Stanwell Moor and the villages and towns around it: Stanwell, Staines-upon-Thames, Ashford,
Bedfont, Feltham, Egham, Colnbrook. Reporting country GB. Heathrow travellers are not the
audience for game nights. Town-name phrasings returned no Keyword Planner data on 17 August
2026; local demand sits in "near me" searches, which Google resolves by proximity and the
Google Business Profile.

## Conversion evidence available

- Management app event bookings, with source (`brand_site` for the website, `sms_reply`,
  `admin`, `walk-in`), seats, and check-ins on a few nights only.
- GA4 property `G-2ZTRYGDRJW`: custom events reach GA4 only when sent through the Measurement
  Protocol route (`sendToApi: true`).
- Search Console for `sc-domain:the-anchor.pub`.

## Owner seasonal calendar

- Halloween party, 31 October 2026 (event record exists).
- Christmas 2026: quiz yes, karaoke no, live band no.
- New Year's Eve: open until 1am, DJ and midnight countdown confirmed.
- Upcoming game nights are listed in the management app; dates vary month to month.

## Business-value rubric

5 core service with capacity and margin; 4 core service; 3 secondary service or occasion;
2 supporting content; 1 peripheral. Intent alignment with the outcome is part of the rubric.

Scores used in `clusters.csv`: Quiz Night 4, Cash Bingo 4, Music Bingo 4, What's On 4, themed
quiz nights 2. The three formats have spare capacity but their margin is not yet known (host
fees and prize costs have not been supplied), so none is scored 5 until the owner confirms it.
