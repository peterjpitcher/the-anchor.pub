import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { getLandmarkBySlug, landmarks, type Landmark, type LandmarkType } from '@/lib/local-seo-data'
import { InteriorHero } from '@/components/hero'
import { Container, SectionHeading, Card, CardBody, Button, Badge } from '@/components/ui'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { GoogleMapEmbed } from '@/components/ui/GoogleMapEmbed'
import { DEFAULT_CORPORATE_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PrivateBookingSection } from '@/components/PrivateBookingSection'
import { CtaBand } from '@/components/CtaBand'
import { InternalLinkingSection } from '@/components/seo/InternalLinkingSection'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { CONTACT, BRAND } from '@/lib/constants'
import { jsonLdSafeStringify } from '@/lib/jsonld'

// Generate static params for all landmarks at build time
export async function generateStaticParams() {
    return landmarks.map((landmark) => ({
        slug: landmark.slug,
    }))
}

// ---------------------------------------------------------------------------
// Per-landmark content model
// ---------------------------------------------------------------------------
// Each landmark page must read as a genuinely distinct page, not the same
// template with the name swapped. The angle below is keyed off LandmarkType
// (with a slug-level override for Heathrow, which is typed `other`) so the
// lead, the reasons-to-choose, the narrative section, the packages framing and
// the FAQ all vary by what kind of place the landmark is. Every fact used here
// is grounded in docs/SSOT.md (capacity 10+ to 150; dining room seats 26; 250
// venue max; 20 free parking spaces; £250 private deposit; £10pp deposit for
// groups of 10+; TVs and a sound system, no projector; dedicated events
// coordinator; ~7 minutes from Heathrow Terminal 5; outside the ULEZ;
// dog-friendly garden). No food or drink prices are quoted (those are live).
// Distances come only from the landmark dataset, never invented door-to-door.

interface FaqEntry {
    question: string
    answer: string
}

interface ReasonCard {
    title: string
    content: string
}

interface NarrativeBlock {
    heading: string
    paragraphs: string[]
}

interface LandmarkAngle {
    /** Short occasion label used in the hero title (e.g. "Wakes & Memorials"). */
    pageLabel: string
    /** Heading line above the hero for context. */
    crumb: string
    /** Hero lead sentence, tuned to the occasion. */
    lead: string
    /** Hero badges, varied so each page carries a distinct set. */
    badges: string[]
    /** BookTableButton context value. */
    bookingContext: string
    /** PrivateBookingSection eventType label. */
    eventType: string
    /** Lead paragraph of the "why choose" section. */
    intro: string
    /** Two reason cards beneath the intro. */
    reasons: [ReasonCard, ReasonCard]
    /** A longer, occasion-specific narrative section. */
    narrative: NarrativeBlock
    /** Heading + intro for the packages section. */
    packagesHeading: string
    packagesIntro: string
    /** Type-specific FAQ block. */
    faqs: FaqEntry[]
}

// Shared facts woven into copy. Kept as small helpers so wording stays
// consistent across the angles and so there is a single place to change a fact.
const PARKING_LINE =
    'a large private car park with 20 free spaces, level and right beside the entrance'
const CAPACITY_LINE =
    'We can seat 26 in the dining room and host larger gatherings of up to 150 across the venue'
const COORDINATOR_LINE =
    'a dedicated events coordinator who handles the setup and timings'
const HEATHROW_LINE =
    'roughly seven minutes from Heathrow Terminal 5 and just outside the ULEZ'

function getLandmarkAngle(landmark: Landmark): LandmarkAngle {
    const { name, distance, type, slug } = landmark

    // Heathrow is typed `other` but deserves its own travel-led angle.
    if (slug === 'heathrow-airport') {
        return {
            pageLabel: 'Private Hire & Events',
            crumb: `Near ${name}`,
            lead: `A relaxed venue for airport gatherings, ${distance} from Terminal 5`,
            badges: [distance, 'Free Parking', 'Outside the ULEZ', 'Luggage Storage'],
            bookingContext: 'private_party',
            eventType: 'Other',
            intro: `${name} keeps unsociable hours, and finding somewhere genuinely comfortable nearby for a leaving do, a crew get-together or a farewell meal is not always easy. The Anchor sits ${HEATHROW_LINE}, so colleagues can gather without a long drive into town and without a congestion or emissions charge on the way.`,
            reasons: [
                {
                    title: 'Easy on the travel',
                    content: `We are ${distance} from ${name}, with ${PARKING_LINE}. Guests arriving by car can park for free, and there is luggage storage if anyone is heading on to a flight afterwards.`,
                },
                {
                    title: 'Built for shift patterns',
                    content: 'Airport teams rarely keep nine-to-five hours. Talk to us about timings and we will work around the rota, whether that is an early finish, a late-afternoon send-off or a weekend get-together.',
                },
            ],
            narrative: {
                heading: `An off-airport venue near ${name}`,
                paragraphs: [
                    `Heathrow has plenty of places to grab a quick coffee, but far fewer that feel like a proper pub where a group can settle in for the afternoon or evening. The Anchor is a traditional village pub in Stanwell Moor, ${HEATHROW_LINE}. For airport staff, ground crews and travellers with time before a flight, it is an easy escape from the terminals.`,
                    `We host leaving dos, team socials, retirement send-offs and farewell dinners for people moving on or moving away. ${CAPACITY_LINE}, with French doors from the dining room onto the beer garden, which sits directly under the flight path if your group enjoys the planes overhead.`,
                    `${COORDINATOR_LINE} will help you plan the food, the drinks and the layout. There is free WiFi throughout, TVs and a sound system in the room, and a dog-friendly garden if anyone is bringing a four-legged friend. Call us on ${CONTACT.phone} and we will talk through what works for your group.`,
                ],
            },
            packagesHeading: 'Food, drinks and a room to call your own',
            packagesIntro: 'From finger buffets to sit-down meals, plus drinks packages and unlimited tea and coffee, we will build something that suits the occasion. Room hire and catering are quoted on enquiry so you only pay for what your group needs.',
            faqs: [
                {
                    question: `How far is The Anchor from ${name}?`,
                    answer: `We are ${distance} from ${name}, in the village of Stanwell Moor. The pub is ${HEATHROW_LINE}.`,
                },
                {
                    question: 'Is there free parking?',
                    answer: 'Yes. We have 20 free parking spaces on site, level and close to the entrance, with additional parking available nearby. There is no charge and no time limit while you are with us.',
                },
                {
                    question: 'Can you store luggage during an event?',
                    answer: `Yes, we offer luggage storage, which is handy if guests are travelling to or from Heathrow around your gathering. Mention it when you call ${CONTACT.phone} and we will make space.`,
                },
                {
                    question: 'Do you charge a congestion or emissions charge nearby?',
                    answer: 'No. The Anchor sits outside the ULEZ zone, so guests driving in avoid the daily emissions charge they would pay at many venues closer to central London.',
                },
                {
                    question: 'How many people can you cater for?',
                    answer: `${CAPACITY_LINE}. Tell us your numbers and we will recommend the right space.`,
                },
                {
                    question: 'Can you work around airport shift patterns?',
                    answer: 'Yes. We are used to airport timings and can arrange daytime, evening or weekend gatherings to fit around the rota. Just let us know what suits your team.',
                },
                {
                    question: 'Is there a room hire charge?',
                    answer: 'Room hire and catering are quoted on enquiry, based on your group size, the space you need and the time of day. Call us and we will give you clear, tailored terms.',
                },
                {
                    question: 'Is the venue dog friendly?',
                    answer: 'Yes, dogs are welcome throughout the venue and in the beer garden, with water bowls and biscuits provided. Dogs should be kept on a lead.',
                },
            ],
        }
    }

    switch (type) {
        case 'crematorium':
            return {
                pageLabel: 'Wakes & Memorials',
                crumb: `Wake venue near ${name}`,
                lead: `A calm, private place to gather after a service, ${distance} away`,
                badges: [`${distance} from ${name}`, 'Private Entrance Area', 'Short Notice Welcome', 'Free Parking'],
                bookingContext: 'wakes',
                eventType: 'Wake / Memorial',
                intro: `Saying goodbye is hard enough without a long, complicated journey to the wake. The Anchor is ${distance} from ${name}, a quiet village pub with a private entrance area where family and friends can gather away from the main bar. ${landmark.description}`,
                reasons: [
                    {
                        title: 'No parking worries on a difficult day',
                        content: `After a service at ${name}, the last thing anyone needs is a scramble for spaces. We have ${PARKING_LINE}, with room for funeral cars, so guests can arrive together and without stress.`,
                    },
                    {
                        title: 'A private, respectful space',
                        content: 'Wakes are held in a self-contained area with its own entrance, set apart from the everyday pub. It is quiet and enclosed, so your gathering stays private throughout the afternoon.',
                    },
                ],
                narrative: {
                    heading: `Holding a wake near ${name}`,
                    paragraphs: [
                        `We have hosted many funeral receptions over the years, and we understand that timings after a service can be unpredictable. We will have the private area set and ready before you arrive from ${name}, and we will never rush you when the gathering naturally winds down.`,
                        `There is a private entrance area so guests can come and go with dignity, away from the main bar. ${CAPACITY_LINE}, so whether you are expecting a small, close family group or a larger gathering, we can arrange the room to suit. ${COORDINATOR_LINE}, liaising directly with your funeral director if that is easier for you.`,
                        `If you would like to display photographs, an order of service or flowers, we will set up a dedicated table. You are welcome to play a favourite piece of music through our sound system. Wakes often need to be arranged at short notice, and we can usually accommodate a booking within 24 to 48 hours. Please call us on ${CONTACT.phone}; there is always someone here to help.`,
                    ],
                },
                packagesHeading: 'Catering for the gathering',
                packagesIntro: 'We offer buffets, afternoon teas and unlimited tea and coffee, with vegetarian, vegan and gluten-free options for mixed groups. There is no room hire charge for wakes, and we will give you a clear, tailored quote when you call.',
                faqs: [
                    {
                        question: `How far is The Anchor from ${name}?`,
                        answer: `We are ${distance} from ${name}. We will have the private area ready before you arrive, and we are happy to allow for a slightly later start if the service runs on.`,
                    },
                    {
                        question: 'How quickly can you arrange a wake?',
                        answer: `We understand that funeral arrangements often happen at short notice. We can usually accommodate a wake within 24 to 48 hours. Call us on ${CONTACT.phone} and we will do our best to help.`,
                    },
                    {
                        question: 'Is there a private space for the wake?',
                        answer: 'Yes. Wakes are held in a self-contained area with a private entrance, set apart from the main bar, so your gathering stays quiet and private throughout.',
                    },
                    {
                        question: 'Is there a room hire charge for a wake?',
                        answer: 'No. There is no room hire charge for wakes. You will only pay for the catering and refreshments you choose, and we will quote that clearly in advance.',
                    },
                    {
                        question: 'Is there parking for funeral cars?',
                        answer: 'Yes. We have 20 free parking spaces on site, level and close to the entrance, with room for funeral cars and larger vehicles, plus additional parking nearby.',
                    },
                    {
                        question: 'How many guests can you accommodate?',
                        answer: `${CAPACITY_LINE}. Let us know your numbers and we will arrange the space to suit.`,
                    },
                    {
                        question: 'Can we bring our own flowers, photos or music?',
                        answer: 'Of course. We will set up a display table for photographs, an order of service or flowers, and you are welcome to play a chosen piece of music through our sound system.',
                    },
                    {
                        question: 'Can you cater for dietary requirements?',
                        answer: 'Yes. We regularly cater for mixed groups and can provide vegetarian, vegan, gluten-free and nut-free options. Please tell us when you book and we will look after everyone.',
                    },
                ],
            }

        case 'church':
            return {
                pageLabel: 'Christenings & Celebrations',
                crumb: `Celebration venue near ${name}`,
                lead: `Somewhere warm to continue the day after your service, ${distance} away`,
                badges: [`${distance} from ${name}`, 'Family Friendly', 'Free Parking', 'Garden & Dining Room'],
                bookingContext: 'christening',
                eventType: 'Christening / Naming Day',
                intro: `After a christening, naming day or service at ${name}, you will want somewhere relaxed to carry on celebrating with family and friends. The Anchor is ${distance} away, a friendly village pub with a private dining room and a garden. ${landmark.description}`,
                reasons: [
                    {
                        title: 'Just minutes from the church',
                        content: `We are ${distance} from ${name}, so guests can move easily from the service to the celebration. With ${PARKING_LINE}, families with young children and older relatives can park right by the door.`,
                    },
                    {
                        title: 'A space the whole family can enjoy',
                        content: 'High chairs, a dog-friendly garden and a private dining room with French doors onto the outside mean there is room for children to be children and for everyone to settle in comfortably.',
                    },
                ],
                narrative: {
                    heading: `Christening receptions near ${name}`,
                    paragraphs: [
                        `A christening or naming day is a happy, family occasion, and we love hosting the celebration that follows. The Anchor is ${distance} from ${name}, ${HEATHROW_LINE}, so guests travelling from further afield can find us easily.`,
                        `Our private dining room seats 26, with French doors opening onto the beer garden, and we can host larger gatherings of up to 150 across the venue. ${COORDINATOR_LINE}, so you can relax and enjoy the day. There are high chairs for little ones, plenty of room for buggies, and a garden where children can play.`,
                        `Choose from buffets, afternoon teas or a sit-down meal, with options for every age and appetite. We are a dog-friendly pub too, so well-behaved dogs are welcome to join the family. Call us on ${CONTACT.phone} to talk through your celebration and we will help you plan it.`,
                    ],
                },
                packagesHeading: 'Food for the celebration',
                packagesIntro: 'From relaxed finger buffets to afternoon teas and sit-down meals, we will tailor the catering to your party, including options for children and any dietary requirements. Room hire and catering are quoted on enquiry.',
                faqs: [
                    {
                        question: `How far is The Anchor from ${name}?`,
                        answer: `We are ${distance} from ${name}, an easy journey for guests heading straight from the service to the celebration.`,
                    },
                    {
                        question: 'Is the venue suitable for families with young children?',
                        answer: 'Yes. We have high chairs, room for buggies, a children\'s menu and a garden where little ones can play. Children are welcome at all hours.',
                    },
                    {
                        question: 'Do you have a private space for a christening party?',
                        answer: 'Yes. Our private dining room seats 26 with French doors onto the garden, and we can arrange larger gatherings of up to 150 across the venue.',
                    },
                    {
                        question: 'Is there free parking?',
                        answer: 'Yes. We have 20 free parking spaces on site, level and close to the entrance, with additional parking nearby. There is no charge and no time limit while you are with us.',
                    },
                    {
                        question: 'Can you cater for a mix of adults and children?',
                        answer: 'Absolutely. We offer buffets, afternoon teas and sit-down meals, with a children\'s menu and vegetarian, vegan and gluten-free options. Let us know your numbers when you book.',
                    },
                    {
                        question: 'How many guests can you host?',
                        answer: `${CAPACITY_LINE}. Tell us your guest count and we will recommend the right space.`,
                    },
                    {
                        question: 'Is the venue dog friendly?',
                        answer: 'Yes, dogs are welcome throughout the venue and in the garden, with water bowls and biscuits provided. Dogs should be kept on a lead.',
                    },
                    {
                        question: 'Is a deposit required?',
                        answer: 'For groups of ten or more, a deposit of £10 per person applies and is fully deducted from your final bill on the day. Smaller groups can book without a deposit. Call us to confirm the details.',
                    },
                ],
            }

        case 'registry_office':
            return {
                pageLabel: 'Celebrations & Receptions',
                crumb: `Celebration venue near ${name}`,
                lead: `A relaxed place to celebrate after your ceremony, ${distance} away`,
                badges: [`${distance} from ${name}`, 'No Town-Centre Parking Stress', 'Free Parking', 'Garden & Dining Room'],
                bookingContext: 'private_party',
                eventType: 'Engagement / Celebration',
                intro: `Once the ceremony at ${name} is over, the celebration begins. The Anchor is ${distance} away, a welcoming village pub where you can gather family and friends for a meal or a drinks reception without the hassle of town-centre parking. ${landmark.description}`,
                reasons: [
                    {
                        title: 'Skip the town-centre parking',
                        content: `Parking near ${name} can be a headache. We are ${distance} away with ${PARKING_LINE}, so every guest can park for free and arrive together after the ceremony.`,
                    },
                    {
                        title: 'Flexible spaces for any celebration',
                        content: 'Whether it is an intimate naming ceremony, an engagement party or a larger reception, we have a private dining room and a garden to suit the size and feel of your day.',
                    },
                ],
                narrative: {
                    heading: `Post-ceremony celebrations near ${name}`,
                    paragraphs: [
                        `After a ceremony at ${name}, you want somewhere relaxed and welcoming to mark the occasion. The Anchor is ${distance} away, ${HEATHROW_LINE}, with free parking that takes the stress out of the journey for everyone.`,
                        `We host naming ceremonies, engagement parties, renewal celebrations and family receptions. Our private dining room seats 26 with French doors onto the beer garden, and we can host larger gatherings of up to 150 across the venue. ${COORDINATOR_LINE}, so the day runs smoothly from arrival to last toast.`,
                        `Choose a drinks reception, a buffet or a sit-down meal, and we will tailor it to your group. There are TVs and a sound system in the room for speeches or a playlist, and a dog-friendly garden for warmer days. Call us on ${CONTACT.phone} and we will help you plan a celebration that fits the occasion.`,
                    ],
                },
                packagesHeading: 'Food and drinks for the day',
                packagesIntro: 'From welcome drinks and buffets to afternoon teas and sit-down meals, we will build a package around your celebration. Room hire and catering are quoted on enquiry, so you only pay for what you need.',
                faqs: [
                    {
                        question: `How far is The Anchor from ${name}?`,
                        answer: `We are ${distance} from ${name}, an easy drive from the ceremony to the celebration with free parking when you arrive.`,
                    },
                    {
                        question: 'Is parking easier here than in the town centre?',
                        answer: 'Yes. We have 20 free parking spaces on site, level and close to the entrance, with additional parking nearby. There is no charge and no time limit, so you avoid town-centre parking stress.',
                    },
                    {
                        question: 'What kind of celebrations do you host?',
                        answer: 'We host naming ceremonies, engagement parties, renewal celebrations and family receptions. We do not host wedding receptions, but we are happy to help with smaller private celebrations.',
                    },
                    {
                        question: 'Do you have a private space?',
                        answer: 'Yes. Our private dining room seats 26 with French doors onto the garden, and we can arrange larger gatherings of up to 150 across the venue.',
                    },
                    {
                        question: 'Can you provide a drinks reception?',
                        answer: 'Yes. We offer welcome drinks and bar service alongside buffets, afternoon teas and sit-down meals. Tell us what you have in mind and we will tailor it.',
                    },
                    {
                        question: 'How many guests can you accommodate?',
                        answer: `${CAPACITY_LINE}. Let us know your numbers and we will recommend the right space.`,
                    },
                    {
                        question: 'Is a deposit required?',
                        answer: 'For groups of ten or more, a deposit of £10 per person applies and is fully deducted from your final bill on the day. Smaller groups can book without a deposit.',
                    },
                    {
                        question: 'Is the garden available?',
                        answer: 'Yes. Our beer garden seats 64 and is dog friendly, with heated areas, and the dining room opens onto it through French doors for warmer days.',
                    },
                ],
            }

        case 'hospital':
            return {
                pageLabel: 'Team Events & Celebrations',
                crumb: `Event venue near ${name}`,
                lead: `An easy, relaxed venue for staff and family gatherings, ${distance} away`,
                badges: [`${distance} from ${name}`, 'Flexible Timings', 'Free Parking', 'Private Dining Room'],
                bookingContext: 'private_party',
                eventType: 'Other',
                intro: `Whether it is a leaving do, a team lunch, a baby shower or a get-together away from the ward, The Anchor gives staff and families near ${name} somewhere relaxed to gather. We are ${distance} away with free parking. ${landmark.description}`,
                reasons: [
                    {
                        title: 'A short hop from the hospital',
                        content: `We are ${distance} from ${name}, with ${PARKING_LINE}. It is an easy journey for colleagues finishing a shift or families marking an occasion.`,
                    },
                    {
                        title: 'Timings that work around shifts',
                        content: 'Hospital teams keep all sorts of hours. Talk to us and we will arrange a daytime, evening or weekend gathering that fits around the rota.',
                    },
                ],
                narrative: {
                    heading: `Gatherings for teams and families near ${name}`,
                    paragraphs: [
                        `The Anchor is a traditional village pub ${distance} from ${name}, ${HEATHROW_LINE}. We host leaving dos, retirement send-offs, team lunches, baby showers and family celebrations for staff and visitors who want a relaxed space away from the hospital.`,
                        `Our private dining room seats 26 with French doors onto the beer garden, and we can host larger gatherings of up to 150 across the venue. ${COORDINATOR_LINE}, and there is free WiFi throughout, TVs and a sound system, and a dog-friendly garden.`,
                        `We know hospital schedules can be unpredictable, so we keep things flexible and can work around shift changes and last-minute numbers. Choose from buffets, afternoon teas or a sit-down meal. Call us on ${CONTACT.phone} and we will help you arrange it.`,
                    ],
                },
                packagesHeading: 'Food and drinks for your gathering',
                packagesIntro: 'From finger buffets to afternoon teas and sit-down meals, plus drinks packages and unlimited tea and coffee, we will tailor the catering to your group. Room hire and catering are quoted on enquiry.',
                faqs: [
                    {
                        question: `How far is The Anchor from ${name}?`,
                        answer: `We are ${distance} from ${name}, an easy journey for staff finishing a shift or families marking an occasion.`,
                    },
                    {
                        question: 'Can you work around hospital shift patterns?',
                        answer: 'Yes. We are used to flexible timings and can arrange daytime, evening or weekend gatherings to fit around the rota. Just let us know what suits your team.',
                    },
                    {
                        question: 'What kinds of events do you host?',
                        answer: 'We host leaving dos, retirement send-offs, team lunches, baby showers and family celebrations. Tell us what you are planning and we will help.',
                    },
                    {
                        question: 'Is there free parking?',
                        answer: 'Yes. We have 20 free parking spaces on site, level and close to the entrance, with additional parking nearby. There is no charge and no time limit while you are with us.',
                    },
                    {
                        question: 'Do you have a private space?',
                        answer: 'Yes. Our private dining room seats 26 with French doors onto the garden, and we can arrange larger gatherings of up to 150 across the venue.',
                    },
                    {
                        question: 'How many people can you cater for?',
                        answer: `${CAPACITY_LINE}. Let us know your numbers and we will recommend the right space.`,
                    },
                    {
                        question: 'Can you cater for dietary requirements?',
                        answer: 'Yes. We can provide vegetarian, vegan, gluten-free and nut-free options for mixed groups. Please tell us when you book and we will look after everyone.',
                    },
                    {
                        question: 'Is a deposit required?',
                        answer: 'For groups of ten or more, a deposit of £10 per person applies and is fully deducted from your final bill on the day. Smaller groups can book without a deposit.',
                    },
                ],
            }

        case 'business_park':
            return {
                pageLabel: 'Corporate & Team Events',
                crumb: `Corporate venue near ${name}`,
                lead: `A relaxed off-site for meetings, lunches and team socials, ${distance} away`,
                badges: [`${distance} from ${name}`, 'Free WiFi', 'Free Parking', 'TVs & Sound System'],
                bookingContext: 'private_party',
                eventType: 'Other',
                intro: `Sometimes the best way to get a team talking is to get them out of the office. The Anchor is ${distance} from ${name}, a relaxed village pub that makes an easy off-site for meetings, client lunches, team socials and end-of-quarter dinners. ${landmark.description}`,
                reasons: [
                    {
                        title: 'An easy off-site location',
                        content: `We are ${distance} from ${name}, with ${PARKING_LINE} and free WiFi throughout, so the team can drive over, park for free and get straight to it.`,
                    },
                    {
                        title: 'Equipped for working sessions',
                        content: 'The private dining room has TVs and a sound system for presentations, plus a relaxed atmosphere for the social side. There is no projector, but the screens handle slides and video well.',
                    },
                ],
                narrative: {
                    heading: `An off-site venue near ${name}`,
                    paragraphs: [
                        `The Anchor is a traditional village pub ${distance} from ${name}, ${HEATHROW_LINE}. It is an easy, professional yet relaxed alternative to the office canteen for away-days, client lunches, team socials and corporate dinners.`,
                        `Our private dining room seats 26 with French doors onto the beer garden, and we can host larger gatherings of up to 150 across the venue. There is free WiFi throughout, TVs and a sound system for presentations (no projector), and ${COORDINATOR_LINE}.`,
                        `Choose from working lunches and finger buffets through to sit-down meals and drinks packages, and we will fit the day around your agenda. With free parking and no ULEZ charge to factor in, it is a straightforward off-site for any team. Call us on ${CONTACT.phone} to plan it.`,
                    ],
                },
                packagesHeading: 'Catering for the working day',
                packagesIntro: 'From working lunches and finger buffets to sit-down meals, drinks packages and unlimited tea and coffee, we will tailor the day to your team. Room hire and catering are quoted on enquiry.',
                faqs: [
                    {
                        question: `How far is The Anchor from ${name}?`,
                        answer: `We are ${distance} from ${name}, an easy off-site journey with free parking when the team arrives.`,
                    },
                    {
                        question: 'Is there free WiFi and somewhere to present?',
                        answer: 'Yes. There is free WiFi throughout the venue, and the private dining room has TVs and a sound system for presentations and video. We do not have a projector, but the screens handle slides well.',
                    },
                    {
                        question: 'What kinds of corporate events do you host?',
                        answer: 'We host away-days, working lunches, client lunches, team socials, end-of-quarter dinners and corporate Christmas parties. Tell us your plans and we will help.',
                    },
                    {
                        question: 'Is there free parking?',
                        answer: 'Yes. We have 20 free parking spaces on site, level and close to the entrance, with additional parking nearby. We are also outside the ULEZ zone, so there is no emissions charge.',
                    },
                    {
                        question: 'Do you have a private space for a meeting?',
                        answer: 'Yes. Our private dining room seats 26 with French doors onto the garden, and we can arrange larger gatherings of up to 150 across the venue.',
                    },
                    {
                        question: 'How many people can you cater for?',
                        answer: `${CAPACITY_LINE}. Let us know your numbers and we will recommend the right space.`,
                    },
                    {
                        question: 'Can you provide a working lunch?',
                        answer: 'Yes. We offer working lunches and finger buffets through to sit-down meals, with vegetarian, vegan and gluten-free options. Let us know your requirements when you book.',
                    },
                    {
                        question: 'Is a deposit required?',
                        answer: 'For groups of ten or more, a deposit of £10 per person applies and is fully deducted from your final bill on the day. Smaller groups can book without a deposit.',
                    },
                ],
            }

        case 'sports_venue':
            return {
                pageLabel: 'Club & Team Events',
                crumb: `Club venue near ${name}`,
                lead: `A relaxed spot for presentations, socials and committee dinners, ${distance} away`,
                badges: [`${distance} from ${name}`, 'Live Sport on Terrestrial TV', 'Free Parking', 'Garden & Dining Room'],
                bookingContext: 'private_party',
                eventType: 'Other',
                intro: `Every club needs somewhere to mark the season. The Anchor is ${distance} from ${name}, a friendly village pub that makes an easy home for end-of-season dinners, presentation nights, committee meetings and supporter get-togethers. ${landmark.description}`,
                reasons: [
                    {
                        title: 'Just down the road from the club',
                        content: `We are ${distance} from ${name}, with ${PARKING_LINE}, so players, families and supporters can all get here easily and park for free.`,
                    },
                    {
                        title: 'Set up for a club night',
                        content: 'The private dining room has TVs and a sound system for presentations and trophy nights, with a relaxed bar and garden for the social side. Live sport is shown on terrestrial channels.',
                    },
                ],
                narrative: {
                    heading: `A venue for club events near ${name}`,
                    paragraphs: [
                        `The Anchor is a traditional village pub ${distance} from ${name}, ${HEATHROW_LINE}. We host end-of-season dinners, presentation nights, committee meetings, team socials and supporter meet-ups for local clubs and teams.`,
                        `Our private dining room seats 26 with French doors onto the beer garden, and we can host larger gatherings of up to 150 across the venue. There are TVs and a sound system for presentations and awards (no projector), free WiFi throughout, and a dog-friendly garden. Live sport is shown on terrestrial channels only.`,
                        `Choose from buffets and sharing platters to sit-down meals and drinks packages, and ${COORDINATOR_LINE}. With free parking and a relaxed, welcoming atmosphere, it is an easy choice for any club occasion. Call us on ${CONTACT.phone} to arrange it.`,
                    ],
                },
                packagesHeading: 'Food and drinks for the club',
                packagesIntro: 'From finger buffets and sharing platters to sit-down meals, drinks packages and unlimited tea and coffee, we will tailor the night to your club. Room hire and catering are quoted on enquiry.',
                faqs: [
                    {
                        question: `How far is The Anchor from ${name}?`,
                        answer: `We are ${distance} from ${name}, an easy journey for players, families and supporters, with free parking when you arrive.`,
                    },
                    {
                        question: 'Can we hold a presentation or awards night?',
                        answer: 'Yes. The private dining room has TVs and a sound system for presentations and trophy nights. We do not have a projector, but the screens handle slides and video well.',
                    },
                    {
                        question: 'What kinds of club events do you host?',
                        answer: 'We host end-of-season dinners, presentation nights, committee meetings, team socials and supporter meet-ups. Tell us your plans and we will help.',
                    },
                    {
                        question: 'Do you show live sport?',
                        answer: 'We show live sport on terrestrial channels (BBC, ITV and Channel 4). We do not have Sky Sports or TNT Sports.',
                    },
                    {
                        question: 'Is there free parking?',
                        answer: 'Yes. We have 20 free parking spaces on site, level and close to the entrance, with additional parking nearby. There is no charge and no time limit while you are with us.',
                    },
                    {
                        question: 'How many people can you cater for?',
                        answer: `${CAPACITY_LINE}. Let us know your numbers and we will recommend the right space.`,
                    },
                    {
                        question: 'Can you cater for a large group?',
                        answer: 'Yes. We offer buffets, sharing platters and sit-down meals for larger groups, with vegetarian, vegan and gluten-free options. Let us know your numbers when you book.',
                    },
                    {
                        question: 'Is a deposit required?',
                        answer: 'For groups of ten or more, a deposit of £10 per person applies and is fully deducted from your final bill on the day. Smaller groups can book without a deposit.',
                    },
                ],
            }

        // `other` (non-Heathrow) and any future type fall back to a general,
        // still-grounded private-hire angle.
        default:
            return {
                pageLabel: 'Private Hire & Events',
                crumb: `Private hire near ${name}`,
                lead: `A flexible venue for your gathering, ${distance} away`,
                badges: [`${distance} from ${name}`, 'Free Parking', 'Private Dining Room', 'Dedicated Coordinator'],
                bookingContext: 'private_party',
                eventType: 'Other',
                intro: `Looking for a relaxed, welcoming venue near ${name}? The Anchor is ${distance} away, a traditional village pub with a private dining room and a beer garden, ideal for celebrations, gatherings and private events. ${landmark.description}`,
                reasons: [
                    {
                        title: 'Easy to reach, easy to park',
                        content: `We are ${distance} from ${name}, with ${PARKING_LINE}, so your guests can arrive together and park for free.`,
                    },
                    {
                        title: 'Flexible spaces for any occasion',
                        content: 'From an intimate gathering in the dining room to a larger party across the venue, we have spaces to suit, with a garden for warmer days.',
                    },
                ],
                narrative: {
                    heading: `A private hire venue near ${name}`,
                    paragraphs: [
                        `The Anchor is a traditional village pub ${distance} from ${name}, ${HEATHROW_LINE}. We host private parties, celebrations and gatherings of all kinds in a relaxed, welcoming setting.`,
                        `Our private dining room seats 26 with French doors onto the beer garden, and we can host larger gatherings of up to 150 across the venue. ${COORDINATOR_LINE}, and there is free WiFi throughout, TVs and a sound system, and a dog-friendly garden.`,
                        `Choose from buffets, afternoon teas or a sit-down meal, plus drinks packages to suit. Call us on ${CONTACT.phone} and we will help you plan an event that fits the occasion.`,
                    ],
                },
                packagesHeading: 'Food and drinks for your event',
                packagesIntro: 'From finger buffets to afternoon teas and sit-down meals, plus drinks packages and unlimited tea and coffee, we will tailor the catering to your group. Room hire and catering are quoted on enquiry.',
                faqs: [
                    {
                        question: `How far is The Anchor from ${name}?`,
                        answer: `We are ${distance} from ${name}, an easy journey with free parking when you arrive.`,
                    },
                    {
                        question: 'Is there free parking?',
                        answer: 'Yes. We have 20 free parking spaces on site, level and close to the entrance, with additional parking nearby. There is no charge and no time limit while you are with us.',
                    },
                    {
                        question: 'Do you have a private space?',
                        answer: 'Yes. Our private dining room seats 26 with French doors onto the garden, and we can arrange larger gatherings of up to 150 across the venue.',
                    },
                    {
                        question: 'How many people can you cater for?',
                        answer: `${CAPACITY_LINE}. Let us know your numbers and we will recommend the right space.`,
                    },
                    {
                        question: 'What kinds of events do you host?',
                        answer: 'We host private parties, celebrations, family gatherings and corporate events. We do not host wedding receptions, but we are happy to help with smaller private celebrations.',
                    },
                    {
                        question: 'Can you cater for dietary requirements?',
                        answer: 'Yes. We can provide vegetarian, vegan, gluten-free and nut-free options for mixed groups. Please tell us when you book and we will look after everyone.',
                    },
                    {
                        question: 'Is the venue dog friendly?',
                        answer: 'Yes, dogs are welcome throughout the venue and in the garden, with water bowls and biscuits provided. Dogs should be kept on a lead.',
                    },
                    {
                        question: 'Is a deposit required?',
                        answer: 'For groups of ten or more, a deposit of £10 per person applies and is fully deducted from your final bill on the day. Smaller groups can book without a deposit.',
                    },
                ],
            }
    }
}

// Metadata varies by landmark type so titles and descriptions are not
// near-duplicates across the cluster.
function getMetaForType(type: LandmarkType, slug: string): { label: string; descriptor: string } {
    if (slug === 'heathrow-airport') {
        return { label: 'Private Hire Venue', descriptor: 'leaving dos, team socials and farewell gatherings' }
    }
    switch (type) {
        case 'crematorium':
            return { label: 'Wake Venue', descriptor: 'wakes, funeral receptions and memorials' }
        case 'church':
            return { label: 'Christening & Celebration Venue', descriptor: 'christenings, naming days and family celebrations' }
        case 'registry_office':
            return { label: 'Celebration Venue', descriptor: 'engagement parties, naming ceremonies and post-ceremony receptions' }
        case 'hospital':
            return { label: 'Event Venue', descriptor: 'leaving dos, team lunches, baby showers and celebrations' }
        case 'business_park':
            return { label: 'Corporate Venue', descriptor: 'away-days, working lunches, team socials and corporate dinners' }
        case 'sports_venue':
            return { label: 'Club Event Venue', descriptor: 'presentation nights, end-of-season dinners and club socials' }
        default:
            return { label: 'Private Hire Venue', descriptor: 'private parties, celebrations and gatherings' }
    }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const landmark = getLandmarkBySlug(params.slug)
    if (!landmark) return {}

    const { label, descriptor } = getMetaForType(landmark.type, landmark.slug)
    const title = `${label} Near ${landmark.name} | The Anchor`
    const description = `${label} for ${descriptor}, ${landmark.distance} from ${landmark.name}. Free parking, flexible private spaces for 10 to 150 guests, and a dedicated coordinator.`

    return {
        title,
        description,
        openGraph: {
            title: `${label} Near ${landmark.name} | The Anchor Stanwell Moor`,
            description: `A welcoming venue for ${descriptor}, just ${landmark.distance} from ${landmark.name}. Free parking and flexible private spaces.`,
            images: [{ url: DEFAULT_CORPORATE_IMAGE, width: 1200, height: 630, alt: 'Private hire venue at The Anchor near Heathrow Airport' }],
        },
        twitter: getTwitterMetadata({
            title: `${label} Near ${landmark.name} | The Anchor Stanwell Moor`,
            description: `A welcoming venue for ${descriptor}, just ${landmark.distance} from ${landmark.name}.`,
            images: [DEFAULT_CORPORATE_IMAGE]
        }),
        alternates: {
            canonical: './'
        }
    }
}

export default function NearLandmarkPage({ params }: { params: { slug: string } }) {
    const landmark = getLandmarkBySlug(params.slug)

    if (!landmark) {
        notFound()
    }

    const angle = getLandmarkAngle(landmark)

    // Cross-link to other nearby venues (same type first) so each page carries a
    // distinct internal-link set and the /private-hire/near/* cluster is densely
    // interlinked, which strengthens crawl signals and reduces the near-duplicate
    // template footprint without inventing per-landmark facts.
    const relatedLandmarks = [
        ...landmarks.filter((l) => l.slug !== landmark.slug && l.type === landmark.type),
        ...landmarks.filter((l) => l.slug !== landmark.slug && l.type !== landmark.type),
    ].slice(0, 6)

    // EventVenue schema, grounded in SSOT venue facts (no price claims).
    const eventVenueSchema = {
        '@context': 'https://schema.org',
        '@type': 'EventVenue',
        '@id': `https://www.the-anchor.pub/private-hire/near/${landmark.slug}#venue`,
        name: `${BRAND.name} Private Dining Room`,
        address: {
            '@type': 'PostalAddress',
            streetAddress: CONTACT.address.street,
            addressLocality: CONTACT.address.town,
            addressRegion: 'Surrey',
            postalCode: CONTACT.address.postcode,
            addressCountry: 'GB',
        },
        telephone: CONTACT.phoneIntl,
        url: `https://www.the-anchor.pub/private-hire/near/${landmark.slug}`,
        image: `https://www.the-anchor.pub${DEFAULT_CORPORATE_IMAGE}`,
        description: `A flexible private hire venue for ${angle.pageLabel.toLowerCase()}, ${landmark.distance} from ${landmark.name}.`,
        maximumAttendeeCapacity: 150,
        amenityFeature: [
            { '@type': 'LocationFeatureSpecification', name: 'Free Parking', value: true },
            { '@type': 'LocationFeatureSpecification', name: 'Private Dining Room', value: true },
            { '@type': 'LocationFeatureSpecification', name: 'Step-free access', value: true },
            { '@type': 'LocationFeatureSpecification', name: 'Catering', value: true },
            { '@type': 'LocationFeatureSpecification', name: 'Dog friendly', value: true },
        ],
        potentialAction: {
            '@type': 'CommunicateAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: 'https://www.the-anchor.pub/private-hire#enquiry',
                actionPlatform: [
                    'https://schema.org/DesktopWebPlatform',
                    'https://schema.org/MobileWebPlatform',
                ],
            },
        },
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify(eventVenueSchema) }}
            />
            <BreadcrumbJsonLd
                items={[
                    { name: 'Home', url: '/' },
                    { name: 'Private Hire', url: '/private-hire' },
                    { name: `${angle.pageLabel} Near ${landmark.name}`, url: `/private-hire/near/${landmark.slug}` },
                ]}
            />

            <InteriorHero
                image="/images/page-headers/private-hire/private-hire.jpg"
                crumb={angle.crumb}
                title={`${angle.pageLabel} Near ${landmark.name}`}
                lead={angle.lead}
                badges={
                    <>
                        {angle.badges.map((b) => (
                            <Badge key={b} variant="sand">{b}</Badge>
                        ))}
                    </>
                }
                actions={
                    <>
                        <BookTableButton
                            source={`near_${landmark.slug}_hero`}
                            variant="primary"
                            size="lg"
                            context={angle.bookingContext}
                            fullWidth
                        >
                            Check Availability
                        </BookTableButton>
                        <PhoneButton
                            phone="01753 682707"
                            source={`near_${landmark.slug}_hero`}
                            variant="outline"
                            size="lg"
                        >
                            Call 01753 682707
                        </PhoneButton>
                    </>
                }
            />

            <section className="py-section-y bg-canvas">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="font-display text-h2 text-ink-strong mb-6">
                            Why Choose The Anchor?
                        </h2>
                        <p className="text-lg text-ink-muted mb-8">
                            {angle.intro}
                        </p>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 text-left">
                            {angle.reasons.map((box) => (
                                <Card key={box.title} className="h-full">
                                    <CardBody className="flex h-full flex-col gap-2">
                                        <h3 className="font-display text-h4 text-ink-strong">{box.title}</h3>
                                        <p className="text-ink-muted">{box.content}</p>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    </div>
                </Container>
            </section>

            {/* Occasion-specific narrative: the main per-landmark unique copy. */}
            <section className="py-section-y bg-surface">
                <Container size="md">
                    <SectionHeading title={angle.narrative.heading} />
                    <div className="max-w-3xl mx-auto space-y-4 text-ink-muted">
                        {angle.narrative.paragraphs.map((para, i) => (
                            <p key={i}>{para}</p>
                        ))}
                    </div>
                </Container>
            </section>

            {/* Map Section */}
            <section className="py-section-y bg-surface-sunk">
                <Container>
                    <SectionHeading
                        title={`Just ${landmark.distance} Away`}
                        script="Easy to find, easy to park"
                    />
                    <div className="max-w-5xl mx-auto h-[400px] rounded-md overflow-hidden shadow-md">
                        <GoogleMapEmbed query={`The Anchor Stanwell Moor near ${landmark.name}`} />
                    </div>
                    <div className="text-center mt-6">
                        <Link href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(landmark.address)}&destination=The+Anchor+Stanwell+Moor+TW19+6AQ`} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline">
                                Get Directions from {landmark.name}
                            </Button>
                        </Link>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <SectionHeading title={angle.packagesHeading} />
                    <p className="max-w-3xl mx-auto text-center text-ink-muted mb-8">
                        {angle.packagesIntro}
                    </p>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            { title: 'Catering', description: 'Buffets, afternoon teas, or sit-down meals tailored to your requirements, with vegetarian, vegan and gluten-free options.' },
                            { title: 'Refreshments', description: 'Unlimited tea and coffee, welcome drinks and a full bar service. Drink choices are confirmed when you book.' },
                            { title: 'Planning', description: 'A dedicated events coordinator handles the setup, layout and timings so you can enjoy the day.' },
                        ].map((feature) => (
                            <Card key={feature.title} accent className="h-full text-center">
                                <CardBody className="flex h-full flex-col gap-2">
                                    <h3 className="font-display text-h4 text-ink-strong">{feature.title}</h3>
                                    <p className="text-ink-muted">{feature.description}</p>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </Container>
            </section>

            <PrivateBookingSection eventType={angle.eventType} />

            <FAQAccordionWithSchema
                title={`Frequently Asked Questions: Near ${landmark.name}`}
                faqs={angle.faqs}
            />

            <InternalLinkingSection
                title="Other venues near you"
                links={relatedLandmarks.map((l) => ({
                    href: `/private-hire/near/${l.slug}`,
                    title: l.name,
                    description: `${l.distance} from The Anchor`,
                }))}
            />

            <CtaBand
                title="Book Your Event"
                copy={`Secure the date for your gathering near ${landmark.name}`}
                primary={
                    <BookTableButton
                        source={`near_${landmark.slug}_cta`}
                        variant="primary"
                        size="lg"
                        context={angle.bookingContext}
                    >
                        Enquire Now
                    </BookTableButton>
                }
                secondary={
                    <PhoneButton
                        phone="01753 682707"
                        source={`near_${landmark.slug}_cta`}
                        variant="outline"
                        size="lg"
                    >
                        Call 01753 682707
                    </PhoneButton>
                }
            />
        </>
    )
}
