/**
 * Venue claims: docs/SSOT.md. Keyword map: tasks/spec-2026-09-05-nations-championship.md.
 * External facts checked 5 September 2026 against Allianz Stadium's Nations Championship
 * guide and ITV's coverage announcement of 26 January 2026. Links render with the copy.
 */
export const nationsEditorial = {
  introduction: 'Looking for where to watch the Nations Championship in a pub near Heathrow? Join us at The Anchor in Stanwell Moor. Choose the match you want to see, check its viewing and food-service times, and book a table for your group. Your booking carries the game details through to our team, so we know which match is bringing you in.',
  autumn: 'The autumn internationals have a new competition behind them in 2026. November\'s Autumn Nations Series becomes the northern leg of the Nations Championship. July and November results decide the group standings for Finals Weekend.',
  teams: 'England, Ireland, Scotland, Wales, France and Italy form the Europe group. Australia, New Zealand, South Africa, Argentina, Fiji and Japan make up the Rest of the World group. Follow one team with the fixture filter, or browse by date to plan an afternoon of rugby.',
  england: 'Make a date with your fellow England supporters. England face Australia, Japan and New Zealand in their November pool matches. Each link below takes you to that game, with the latest kick-off, pub viewing times and table-booking button together in one place.',
  finals: 'Finals Weekend brings all 12 teams to Allianz Stadium, Twickenham, from 27 to 29 November 2026. Each side plays the team in the equivalent position in the other group; first plays first for the title. The fixtures above show the six matches, with opponents updated once the standings settle.',
  television: 'ITV has confirmed free-to-air coverage of every 2026 Nations Championship fixture on ITV and STV in the UK. We are showing the terrestrial TV games during our existing opening hours. You can book your table now, without waiting for an individual channel listing. Check your chosen fixture for the part of the match we can show.',
  food: 'Rugby is a good reason to get everyone round a table, and lunch makes an afternoon of it. Our menu includes fish and chips, burgers, pies and stone-baked pizzas. On Sundays, a roast can be part of your visit when your booking falls within kitchen service. Browse the current menu for dishes and prices before choosing your arrival time.',
  foodTiming: 'Use the food message on your game to plan when to eat. If the kitchen is serving during the match, the card shows the service window. For later kick-offs, it may show an earlier opportunity to eat instead. Kitchen closing time still applies while the rugby is on, so do not leave your food order until half-time without checking.',
  hours: 'Please arrive during our usual opening hours. When a match kicks off before we open, viewing starts at opening and you will miss the start. If a game runs beyond our usual closing time and people are still here watching, we will stay open until it finishes. Kitchen service times remain unchanged.',
  groups: 'Bring friends or make it a family visit: children are welcome at The Anchor at all hours, and we have high chairs and a kids menu. Choose a game and then an available arrival time for your party. If you are planning to watch several games, speak to us about your visit before booking.',
  travel: 'You will find us on Horton Road, Stanwell Moor, Surrey, TW19 6AQ, near Heathrow and Staines. There are 20 free customer parking spaces while you visit, available on a first-come basis. Use our directions page to plan your route, then choose the match you want to join us for.',
} as const

export const englandNationsFixtures = [
  { importKey: 'nations-2026-291600', label: 'England v Australia rugby 2026' },
  { importKey: 'nations-2026-291601', label: 'England v Japan rugby 2026' },
  { importKey: 'nations-2026-291607', label: 'England v New Zealand rugby 2026' },
] as const
export const nationsFaqs = [
  { question: 'What happens if a game starts before the pub opens?', answer: 'We show the game from our current opening time. The fixture card shows kick-off and when viewing starts, so you can see if you will miss the start. Booking times follow our usual opening hours.' },
  { question: 'Can I book a table for a particular game?', answer: 'Choose your game in the fixture list and use its booking button. We carry the match into your booking so the team knows which game you are coming to watch. Available arrival times are shown during booking.' },
  { question: 'Can we eat while watching the rugby?', answer: 'Where a screening overlaps kitchen service, the fixture card shows when food is served and links to the menu. Some games overlap only part of service, so check the opening and closing times shown for your match.' },
  { question: 'Are you showing every Nations Championship game?', answer: 'Check each fixture for its screening status. We show games broadcast on terrestrial television during our existing opening hours. Book your chosen game using its booking button. Viewing starts at opening. If people are still here watching a game that runs beyond our usual closing time, we will stay open until it finishes.' },
  { question: 'What channel is Nations Championship on?', answer: 'We show Nations Championship games broadcast on terrestrial TV. You can book without waiting for the exact channel listing; channel details will follow when available.' },
  { question: 'Will the commentary be on?', answer: 'Commentary arrangements are confirmed separately and added to the fixture card when available. Your booking does not depend on commentary being confirmed. Games played at the same time can have different arrangements.' },
  { question: 'What if the match finishes after the pub closes?', answer: 'If people are still here watching, we will stay open until the game finishes. Please arrive before our usual closing time. This does not extend kitchen service or guarantee late entry.' },
  { question: 'Can children come to watch the rugby?', answer: 'Yes, children are welcome at The Anchor at all hours. We have high chairs and a kids menu during kitchen service.' },
  { question: 'Is there parking?', answer: 'There are 20 free customer parking spaces while you are visiting The Anchor, available on a first-come basis.' },
] as const
