import { PARKING, HEATHROW_TIMES } from '@/lib/constants'
import { PRIVATE_HIRE_CAPACITY } from '@/lib/private-hire-capacity'
import { ROOM_HIRE_WORDING } from '@/lib/approved-wording'
// Copy for the blog tag pages. Every fact here comes from docs/SSOT.md.
//
// A tag page exists only for a tag carried by at least one post that is not
// `noindex`. This file holds an entry for each of those tags, plus 'offers'.
// Any other tag gets the plain fallback below, which states no facts beyond
// the pub's name, village, phone number and email address.
export interface TagSEOContent {
  name: string
  description: string
  metaTitle: string
  metaDescription: string
  heroContent: string
  introContent: string
  valueProposition: string
  keywords: string[]
}

// Generate fallback SEO content for tags without specific content
export function generateFallbackSEOContent(tag: string): TagSEOContent {
  const name = tag.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  const lowerName = name.toLowerCase()

  return {
    name: name,
    description: `Posts about ${lowerName}`,
    metaTitle: `${name} | The Anchor Stanwell Moor`,
    metaDescription: `Posts about ${lowerName} from The Anchor, your village pub in Stanwell Moor.`,
    heroContent: `Everything we've written about ${lowerName}.`,
    introContent: `These are our posts about ${lowerName}. We're The Anchor, a village pub in Stanwell Moor since 1751.`,
    valueProposition: 'Want to know more? Call us on 01753 682707 or email manager@the-anchor.pub.',
    keywords: [
      `${tag} stanwell moor`,
      `${tag} TW19`,
      `the anchor ${tag}`
    ]
  }
}

// Get SEO content for a tag (with fallback)
export function getTagSEOContent(tag: string): TagSEOContent {
  // Own-property guard, not a truthiness check. `tagSEOContent` is a plain
  // object literal, so it inherits from Object.prototype: a lookup for
  // `constructor` or `__proto__` returned a truthy value that is not a
  // TagSEOContent, the fallback never fired, and the undefined metaTitle threw
  // in getTwitterMetadata. That served HTTP 500 on /blog/tag/constructor and
  // /blog/tag/__proto__ in production.
  if (!Object.prototype.hasOwnProperty.call(tagSEOContent, tag)) {
    return generateFallbackSEOContent(tag)
  }

  return tagSEOContent[tag]
}

export const tagSEOContent: Record<string, TagSEOContent> = {
  'events': {
    name: 'Events',
    description: 'Quiz nights, cash bingo, Music Bingo with Nikki Manfadge and one-off nights',
    metaTitle: 'Pub Events in Stanwell Moor | What\'s On at The Anchor',
    metaDescription: 'Quiz nights, cash bingo and Music Bingo with Nikki Manfadge at The Anchor in Stanwell Moor. See what\'s on for the latest dates.',
    heroContent: 'Quiz night, cash bingo and Music Bingo with Nikki Manfadge all happen here. Come along, you don\'t need to be a regular.',
    introContent: 'The quiz is monthly, on a Wednesday, and Peter, the owner, hosts it himself. Cash bingo runs on set Wednesdays, and Music Bingo with Nikki Manfadge is on a Friday. Karaoke, tasting nights and party nights happen now and then. See what\'s on for the latest dates.',
    valueProposition: `Pick a night, see what's on for the dates and book your places. We've ${PARKING.capacity} free parking spaces right outside.`,
    keywords: ['pub events stanwell moor', 'events near heathrow', 'what\'s on stanwell moor', 'quiz night stanwell moor', 'music bingo stanwell moor']
  },

  'community': {
    name: 'Community & Local',
    description: 'Village news, charity nights and what\'s been happening in Stanwell Moor',
    metaTitle: 'Stanwell Moor Community | The Anchor, Your Village Pub',
    metaDescription: 'News from the village and The Anchor in Stanwell Moor: the community notice board, charity nights and what\'s been happening at your local.',
    heroContent: 'We\'ve been Stanwell Moor\'s village pub since 1751. This is where we write about the village and the people in it.',
    introContent: 'There\'s a community notice board in the pub, so have a look next time you\'re in. On 25 September 2026 we held a charity quiz for Macmillan Cancer Support, with the Stanwell Moor Community Wellbeing Garden. Every entry fee went to Macmillan.',
    valueProposition: 'New to the village or lived here for years, you\'re welcome. Come in and say hello.',
    keywords: ['stanwell moor community pub', 'local pub near heathrow', 'village pub stanwell moor', 'stanwell moor local', 'charity quiz stanwell moor']
  },

  'parking': {
    name: 'Heathrow Parking Guides',
    description: 'Guides to parking near Heathrow, terminal by terminal',
    metaTitle: 'Heathrow Parking Guides | The Anchor Stanwell Moor',
    metaDescription: `Guides to parking near Heathrow from The Anchor in Stanwell Moor, ${HEATHROW_TIMES.rangeWords} by car from any terminal.`,
    heroContent: 'Flying from Heathrow and working out where to leave the car? These guides walk you through it.',
    introContent: 'We run paid airport parking from our own car park in Stanwell Moor. It\'s floodlit, on a level surface and has CCTV. You arrange your own transfer to the terminal, and you can collect your car at any hour. It\'s separate from the free parking you get while you\'re visiting the pub.',
    valueProposition: 'You can change or cancel your parking booking up to 24 hours before your booked arrival time, and a cancelled booking is refunded less the payment fee.',
    keywords: ['heathrow parking guide', 'parking near heathrow', 'terminal 5 parking stanwell moor', 'airport parking stanwell moor', 'off airport parking heathrow']
  },

  'sports': {
    name: 'Live Sport',
    description: 'Live sport on BBC, ITV and Channel 4',
    metaTitle: 'Live Sport on TV | The Anchor Stanwell Moor',
    metaDescription: 'Watch the big free-to-air games at The Anchor in Stanwell Moor. We show live sport on BBC, ITV and Channel 4, on 4 TVs.',
    heroContent: 'Watch the big free-to-air games with us. We show live sport on BBC, ITV and Channel 4, on 4 TVs.',
    introContent: 'We show live sport on BBC, ITV and Channel 4. The commentary\'s on for big games and tournaments. Want to check a particular game? Call us on 01753 682707.',
    valueProposition: 'Coming with friends? Book a table and watch with us.',
    keywords: ['sports pub stanwell moor', 'watch football near heathrow', 'terrestrial sport stanwell moor', 'live sport TW19', 'match day stanwell moor']
  },

  'offers': {
    name: 'Offers',
    description: 'The offer running at the bar',
    metaTitle: 'Offers | The Anchor Stanwell Moor',
    metaDescription: 'The £2 double-up on house spirits is running at The Anchor in Stanwell Moor. A double is £2 more than a single.',
    heroContent: 'One offer is running: the £2 double-up on our house spirits. A double is £2 more than a single.',
    introContent: 'That\'s the one offer on at the moment. If we run another, you\'ll only read about it here while it\'s on.',
    valueProposition: 'Ask for a double-up at the bar next time you\'re in.',
    keywords: ['pub offers stanwell moor', 'double up spirits stanwell moor', 'the anchor offers']
  },

  'news': {
    name: 'Latest News',
    description: 'Updates and announcements from The Anchor',
    metaTitle: 'Pub News | The Anchor Stanwell Moor',
    metaDescription: 'News from The Anchor in Stanwell Moor: what\'s changed, what\'s coming up and what\'s been happening at your local.',
    heroContent: 'What\'s new at The Anchor, straight from us.',
    introContent: 'This is where we tell you what\'s changed at the pub and what\'s coming up. For dates, see what\'s on. For opening times, check our live hours before you set off.',
    valueProposition: 'Got a question? Call us on 01753 682707 or email manager@the-anchor.pub.',
    keywords: ['pub news stanwell moor', 'the anchor news', 'stanwell moor news', 'pub announcements TW19']
  },

  'seasonal': {
    name: 'Seasonal',
    description: 'Christmas at The Anchor and what\'s on now',
    metaTitle: 'Seasonal News | The Anchor Stanwell Moor',
    metaDescription: 'Christmas sittings at The Anchor in Stanwell Moor run from 10 November to 20 December 2026. See what\'s on for everything else coming up.',
    heroContent: 'Christmas sittings run from 10 November to 20 December 2026.',
    introContent: 'To see what\'s happening now, have a look at what\'s on.',
    valueProposition: 'Planning a Christmas meal? Call us on 01753 682707 or email manager@the-anchor.pub.',
    keywords: ['christmas stanwell moor pub', 'christmas meal near heathrow', 'seasonal events stanwell moor', 'what\'s on stanwell moor']
  },

  'food-and-drink': {
    name: 'Food & Drink',
    description: 'Sunday roasts, pizzas, pub classics and what\'s behind the bar',
    metaTitle: 'Food & Drink | The Anchor Stanwell Moor',
    metaDescription: `Food and drink at The Anchor in Stanwell Moor: Sunday roasts, stone-baked pizzas, pub classics and the bar. ${PARKING.capacity} free parking spaces.`,
    heroContent: 'Sunday roasts, stone-baked pizzas and pub classics. Here\'s what we\'ve written about the food and the bar.',
    introContent: 'The kitchen does fish and chips, burgers, pies and stone-baked pizzas, with roasts on Sundays. There\'s nothing to order in advance for a Sunday roast. Behind the bar we\'ve draught lagers, bottled ales and spirits.',
    valueProposition: 'Hungry? Book a table online or call us on 01753 682707. Kitchen times change by day, so check our live hours before you come.',
    keywords: ['pub food stanwell moor', 'food and drink near heathrow', 'sunday roast TW19', 'stone baked pizza stanwell moor', 'pub menu near heathrow airport']
  },

  'guides': {
    name: 'Visitor Guides & How-Tos',
    description: 'Practical guides to visiting The Anchor, planning a party and travelling through Heathrow',
    metaTitle: 'Guides | The Anchor Stanwell Moor',
    metaDescription: 'Practical guides from The Anchor in Stanwell Moor: visiting the pub, planning a party and travelling through Heathrow.',
    heroContent: 'First visit, planning a party or flying from Heathrow? These guides give you the practical answers.',
    introContent: `You'll find guides to Sunday roasts, private hire and getting to and from the airport. We're ${HEATHROW_TIMES.terminal5} minutes by car from Terminal 5, ${HEATHROW_TIMES.terminal2} minutes from Terminals 2 and 3, and ${HEATHROW_TIMES.terminal4} minutes from Terminal 4.`,
    valueProposition: 'Got a question our guides don\'t cover? Email manager@the-anchor.pub or call 01753 682707.',
    keywords: ['visitor guide stanwell moor pub', 'heathrow area guide TW19', 'pub near heathrow tips', 'planning a party stanwell moor', 'the anchor pub guides']
  },

  'private-hire': {
    name: 'Private Hire & Events',
    description: 'Private hire, party planning and ideas for your event at The Anchor',
    metaTitle: 'Private Hire | The Anchor Stanwell Moor',
    metaDescription: `Private hire at The Anchor in Stanwell Moor for ${PRIVATE_HIRE_CAPACITY.recommendedRange}. Birthdays, retirement parties, christenings and wakes, with free parking.`,
    heroContent: `Planning a party? We host private hire for ${PRIVATE_HIRE_CAPACITY.recommendedRange}. These posts help you plan yours.`,
    introContent: `We host milestone birthdays, retirement parties, christenings, engagement parties, baby showers and wakes. You can hire the dining room, the garden or the whole pub. The dining room seats ${PRIVATE_HIRE_CAPACITY.spaces.diningRoom.seated}, or holds up to ${PRIVATE_HIRE_CAPACITY.spaces.diningRoom.standing} standing, and its French doors open onto the beer garden. ${ROOM_HIRE_WORDING}`,
    valueProposition: 'Tell us your date and rough numbers and we\'ll talk you through it. Email manager@the-anchor.pub or call 01753 682707.',
    keywords: ['private hire stanwell moor', 'function room near heathrow', 'party venue TW19', 'private event pub stanwell moor', 'book function room stanwell moor']
  },

  'travel': {
    name: 'Travel Tips',
    description: 'Heathrow travel tips from a village pub near the airport',
    metaTitle: 'Travel Tips | The Anchor Near Heathrow',
    metaDescription: `Travel tips from The Anchor in Stanwell Moor, ${HEATHROW_TIMES.rangeWords} by car from any Heathrow terminal. Where to eat before a flight and where to park.`,
    heroContent: 'Flying from Heathrow? These posts cover the practical stuff.',
    introContent: `We're ${HEATHROW_TIMES.rangeWords} by car from any Heathrow terminal, so plenty of travellers call in. These posts cover where to park, how long to allow for the drive to your terminal and where to eat before you fly.`,
    valueProposition: `Flying soon? Come in for a meal before you go. We've ${PARKING.capacity} free parking spaces for while you're with us. Check our live hours before you set off.`,
    keywords: ['travel tips heathrow airport', 'pre flight meal near heathrow', 'things to do before flight heathrow', 'pub near heathrow for travellers', 'heathrow travel advice stanwell moor']
  },

  'heathrow': {
    name: 'Heathrow & Airport Life',
    description: 'Posts about Heathrow Airport and what\'s nearby',
    metaTitle: 'Heathrow | The Anchor Stanwell Moor',
    metaDescription: `Heathrow posts from The Anchor in Stanwell Moor, ${HEATHROW_TIMES.rangeWords} by car from any terminal. Terminal guides and local tips.`,
    heroContent: 'Posts about Heathrow, the terminals and life next door to the airport.',
    introContent: `We're ${HEATHROW_TIMES.rangeWords} by car from any Heathrow terminal, and we've ${PARKING.capacity} free parking spaces right outside. Airport staff coming off shift call in, and so do travellers. The beer garden sits under Heathrow's southern runway approach path, so you can watch the planes come over.`,
    valueProposition: 'We\'re on Horton Road in Stanwell Moor. Book a table or just turn up.',
    keywords: ['pub near heathrow airport', 'heathrow airport local pub', 'pub near heathrow terminal 5', 'eating near heathrow terminals', 'stanwell moor heathrow pub']
  },

  'birthdays': {
    name: 'Birthday Celebrations',
    description: 'Birthday party ideas and planning tips',
    metaTitle: 'Birthday Parties | The Anchor Stanwell Moor',
    metaDescription: `Plan a birthday party at The Anchor in Stanwell Moor. Private hire for ${PRIVATE_HIRE_CAPACITY.recommendedRange}, buffets and free parking.`,
    heroContent: 'We host birthday parties, from the dining room to the whole pub. These posts help you plan yours.',
    introContent: `The dining room seats ${PRIVATE_HIRE_CAPACITY.spaces.diningRoom.seated}, or holds up to ${PRIVATE_HIRE_CAPACITY.spaces.diningRoom.standing} standing. The whole pub takes ${PRIVATE_HIRE_CAPACITY.spaces.entirePub.seated} seated or ${PRIVATE_HIRE_CAPACITY.spaces.entirePub.standing} standing. We do buffets, and you're welcome to bring a celebration cake. We'll ask whoever brings it to sign our outside-food waiver.`,
    valueProposition: 'Planning a birthday? Email manager@the-anchor.pub with your rough numbers and the date you\'d like. We\'ll talk you through the options.',
    keywords: ['birthday party venue stanwell moor', 'milestone birthday pub near heathrow', 'birthday celebration TW19', 'private birthday party stanwell moor', '50th birthday venue near heathrow']
  },

}
