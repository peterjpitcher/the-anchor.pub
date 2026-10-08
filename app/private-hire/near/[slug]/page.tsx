import { CHILDREN_WELCOME_WORDING, DOGS_WORDING, FAMILIES_WORDING, LUGGAGE_WORDING, PARKING_WORDING, PRIVATE_HIRE_DEPOSIT_WORDING, PRIVATE_HIRE_DIETARY_QUESTION, PRIVATE_HIRE_DIETARY_WORDING, PRIVATE_HIRE_TIMES_WORDING, SLIDESHOW_WORDING, SPORT_WORDING, ULEZ_WORDING } from '@/lib/approved-wording'
import { PRIVATE_HIRE_CAPACITY } from '@/lib/private-hire-capacity'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getLandmarkBySlug, landmarks, type Landmark, type LandmarkType } from '@/lib/local-seo-data'
import { InteriorHero } from '@/components/hero'
import { Container, SectionHeading, Card, CardBody, Badge } from '@/components/ui'
import { DirectionsButton } from '@/components/DirectionsButton'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { GoogleMapEmbed } from '@/components/ui/GoogleMapEmbed'
import { DEFAULT_CORPORATE_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PrivateBookingSection } from '@/components/PrivateBookingSection'
import { BrochureDownload } from '@/components/features/PrivateHire/BrochureDownload'
import { CtaBand } from '@/components/CtaBand'
import { InternalLinkingSection } from '@/components/seo/InternalLinkingSection'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { CONTACT, BRAND, PARKING, HEATHROW_TIMES, HEATHROW_TIMES_WORDING } from '@/lib/constants'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { ACCESS_AMENITY_FEATURES } from '@/lib/approved-wording'

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
// is grounded in docs/SSOT.md and read from its home: capacities from
// lib/private-hire-capacity.ts, parking and the Terminal 5 time from
// lib/constants.ts, and the parking, dogs, families and ULEZ sentences from
// lib/approved-wording.ts. No food or drink prices are quoted (those are live).
// A drive time comes only from the landmark dataset, and most landmarks have
// none, so every sentence here must read well without one.

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
const { diningRoom, mainArea } = PRIVATE_HIRE_CAPACITY.spaces
const PARKING_LINE =
    `${PARKING.capacity} free spaces right outside`
const CAPACITY_LINE =
    `We can seat ${diningRoom.seated} in the dining room and host larger gatherings of up to ${mainArea.standing} across the venue`
const DINING_ROOM_LINE =
    `Our private dining room seats ${diningRoom.seated} with French doors onto the beer garden, and we can host larger gatherings of up to ${mainArea.standing} across the venue`
const PRIVATE_SPACE_ANSWER =
    `Yes. Our private dining room seats ${diningRoom.seated} with French doors onto the garden, and we can arrange larger gatherings of up to ${mainArea.standing} across the venue.`
const COORDINATOR_LINE =
    'a dedicated events coordinator who handles the setup and timings'
const HEATHROW_LINE =
    `${HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5 and outside the ULEZ zone`

// "10 mins drive from X" when the landmark has a drive time on record, and
// nothing when it has not. Heathrow's entry is a range across the terminals,
// so it is never offered as one time to "the airport".
function whereFrom(landmark: Landmark): string | undefined {
    if (landmark.slug === 'heathrow-airport') {
        return `${HEATHROW_TIMES.rangeWords} by car from the Heathrow terminals`
    }
    return landmark.distance ? `${landmark.distance} from ${landmark.name}` : undefined
}

function getLandmarkAngle(landmark: Landmark): LandmarkAngle {
    const { name, distance, type, slug } = landmark

    // Most landmarks have no drive time, so each of these reads without one.
    const away = distance ? `, ${distance} away` : ''
    const distanceBadge = distance ? [`${distance} from ${name}`] : []
    const isFrom = distance ? `${distance} from ${name}` : `near ${name}`
    const reach = distance ? `We are ${distance} from ${name}, with` : 'We have'
    const howFar = (rest: string): FaqEntry[] =>
        distance
            ? [{ question: `How far is The Anchor from ${name}?`, answer: `We are ${distance} from ${name}${rest}` }]
            : []

    // Heathrow is typed `other` but deserves its own travel-led angle.
    if (slug === 'heathrow-airport') {
        return {
            pageLabel: 'Private Hire & Events',
            crumb: `Near ${name}`,
            lead: `A relaxed venue for airport gatherings, ${HEATHROW_TIMES.terminal5} minutes from Terminal 5`,
            badges: [...(distance ? [distance] : []), 'Free Parking', 'Outside the ULEZ', 'Luggage Storage'],
            bookingContext: 'private_party',
            eventType: 'Other',
            intro: `${name} keeps unsociable hours, and finding somewhere genuinely comfortable nearby for a leaving do, a crew get-together or a farewell meal is not always easy. The Anchor sits ${HEATHROW_LINE}, so colleagues can gather without a long drive into town.`,
            reasons: [
                {
                    title: 'Easy on the travel',
                    content: `We are ${HEATHROW_TIMES_WORDING}. ${PARKING_WORDING} ${LUGGAGE_WORDING}`,
                },
                {
                    title: 'Tell us your timings',
                    content: `Airport teams rarely keep nine-to-five hours. ${PRIVATE_HIRE_TIMES_WORDING}`,
                },
            ],
            narrative: {
                heading: `An off-airport venue near ${name}`,
                paragraphs: [
                    `Heathrow has plenty of places to grab a quick coffee, but far fewer that feel like a proper pub where a group can settle in for the afternoon or evening. The Anchor is a traditional village pub in Stanwell Moor, ${HEATHROW_LINE}. For airport staff, ground crews and travellers with time before a flight, it is an easy escape from the terminals.`,
                    `We host leaving dos, team socials, retirement send-offs and farewell dinners for people moving on or moving away. ${CAPACITY_LINE}, with French doors from the dining room onto the beer garden, which sits directly under the flight path if your group enjoys the planes overhead.`,
                    `A dedicated events coordinator will help you plan the food, the drinks and the layout. There is free WiFi throughout, and we have TVs and a sound system. ${DOGS_WORDING} Call us on ${CONTACT.phone} and we will talk through what works for your group.`,
                ],
            },
            packagesHeading: 'Food, drinks and a room to call your own',
            packagesIntro: 'From finger buffets to sit-down meals, plus drinks packages and unlimited tea and coffee, we will build something that suits the occasion. Room hire and catering are quoted on enquiry so you only pay for what your group needs.',
            faqs: [
                {
                    question: `How far is The Anchor from ${name}?`,
                    answer: `We are in the village of Stanwell Moor, ${HEATHROW_TIMES_WORDING}. ${ULEZ_WORDING}`,
                },
                {
                    question: 'Is there free parking?',
                    answer: PARKING_WORDING,
                },
                {
                    question: 'Can you store luggage during an event?',
                    answer: `Yes. ${LUGGAGE_WORDING}`,
                },
                {
                    question: 'How many people can you cater for?',
                    answer: `${CAPACITY_LINE}. Tell us your numbers and we will recommend the right space.`,
                },
                {
                    question: 'Can you fit around airport shift times?',
                    answer: PRIVATE_HIRE_TIMES_WORDING,
                },
                {
                    question: 'Is there a room hire charge?',
                    answer: 'Room hire and catering are quoted on enquiry, based on your group size, the space you need and the time of day. Call us and we will give you clear, tailored terms.',
                },
                {
                    question: 'Is the venue dog friendly?',
                    answer: DOGS_WORDING,
                },
            ],
        }
    }

    switch (type) {
        case 'crematorium':
            return {
                pageLabel: 'Wakes & Memorials',
                crumb: `Wake venue near ${name}`,
                lead: `A calm, private place to gather after a service${away}`,
                badges: [...distanceBadge, 'Private Entrance Area', 'Short Notice Welcome', 'Free Parking'],
                bookingContext: 'wakes',
                eventType: 'Wake / Memorial',
                intro: `Saying goodbye is hard enough without a long, complicated journey to the wake. The Anchor is ${isFrom}, a quiet village pub with a private entrance area where family and friends can gather away from the main bar. ${landmark.description}`,
                reasons: [
                    {
                        title: 'Free parking right outside',
                        content: PARKING_WORDING,
                    },
                    {
                        title: 'A private, respectful space',
                        content: 'Wakes have a private entrance area, set apart from the main bar, so family and friends can gather quietly.',
                    },
                ],
                narrative: {
                    heading: `Holding a wake near ${name}`,
                    paragraphs: [
                        `We understand that timings after a service can be unpredictable. We will have the private area set and ready before you arrive from ${name}, and we will never rush you when the gathering naturally winds down.`,
                        `There is a private entrance area so guests can come and go with dignity, away from the main bar. ${CAPACITY_LINE}, so whether you are expecting a small, close family group or a larger gathering, we can arrange the room to suit. You'll have ${COORDINATOR_LINE}.`,
                        `If you would like to display photographs, an order of service or flowers, we will set up a dedicated table. You are welcome to play a favourite piece of music through our sound system. Wakes often need to be arranged at short notice, and we can usually accommodate a booking within 24 to 48 hours. Please call us on ${CONTACT.phone}.`,
                    ],
                },
                packagesHeading: 'Catering for the gathering',
                packagesIntro: `We offer buffets, afternoon teas and unlimited tea and coffee. ${PRIVATE_HIRE_DIETARY_WORDING} We will give you a clear quote covering room hire and catering when you call.`,
                faqs: [
                    ...howFar('. We will have the private area ready before you arrive, and we are happy to allow for a slightly later start if the service runs on.'),
                    {
                        question: 'How quickly can you arrange a wake?',
                        answer: `We understand that funeral arrangements often happen at short notice. We can usually accommodate a wake within 24 to 48 hours. Call us on ${CONTACT.phone} and we will do our best to help.`,
                    },
                    {
                        question: 'Is there a private space for the wake?',
                        answer: 'Yes. Wakes have a private entrance area, set apart from the main bar.',
                    },
                    {
                        question: 'Is there a room hire charge for a wake?',
                        answer: 'Yes. Room hire is charged by the hour for the space you use, alongside the catering and refreshments you choose. We will quote the whole thing clearly in advance so there are no surprises.',
                    },
                    {
                        question: 'Is there free parking?',
                        answer: PARKING_WORDING,
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
                        question: PRIVATE_HIRE_DIETARY_QUESTION,
                        answer: PRIVATE_HIRE_DIETARY_WORDING,
                    },
                ],
            }

        case 'church':
            return {
                pageLabel: 'Christenings & Celebrations',
                crumb: `Celebration venue near ${name}`,
                lead: `Somewhere warm to continue the day after your service${away}`,
                badges: [...distanceBadge, 'Family Friendly', 'Free Parking', 'Garden & Dining Room'],
                bookingContext: 'christening',
                eventType: 'Christening / Naming Day',
                intro: `After a christening, naming day or service at ${name}, you will want somewhere relaxed to carry on celebrating with family and friends. The Anchor is ${distance ? `${distance} away, ` : ''}a friendly village pub with a private dining room and a garden. ${landmark.description}`,
                reasons: [
                    {
                        title: 'From the service to the celebration',
                        content: `${distance ? `We are ${distance} from ${name}, so guests can move easily from the service to the celebration. ` : ''}${PARKING_WORDING}`,
                    },
                    {
                        title: 'A space the whole family can enjoy',
                        content: `${FAMILIES_WORDING} The private dining room has French doors onto the garden.`,
                    },
                ],
                narrative: {
                    heading: `Christening celebrations near ${name}`,
                    paragraphs: [
                        `A christening or naming day is a happy, family occasion, and we love hosting the celebration that follows. The Anchor is ${isFrom}, ${HEATHROW_LINE}, so guests travelling from further afield can find us easily.`,
                        `${DINING_ROOM_LINE}. You'll have ${COORDINATOR_LINE}, so you can relax and enjoy the day. ${FAMILIES_WORDING}`,
                        `Choose from buffets, afternoon teas or a sit-down meal, with options for every age and appetite. ${DOGS_WORDING} Call us on ${CONTACT.phone} to talk through your celebration and we will help you plan it.`,
                    ],
                },
                packagesHeading: 'Food for the celebration',
                packagesIntro: `From relaxed finger buffets to afternoon teas and sit-down meals, we will tailor the catering to your party, including options for children. ${PRIVATE_HIRE_DIETARY_WORDING} Room hire and catering are quoted on enquiry.`,
                faqs: [
                    ...howFar(', an easy journey for guests heading straight from the service to the celebration.'),
                    {
                        question: 'Is the venue suitable for families with young children?',
                        answer: `${FAMILIES_WORDING} There's a children's menu too. ${CHILDREN_WELCOME_WORDING}`,
                    },
                    {
                        question: 'Do you have a private space for a christening party?',
                        answer: PRIVATE_SPACE_ANSWER,
                    },
                    {
                        question: 'Is there free parking?',
                        answer: PARKING_WORDING,
                    },
                    {
                        question: 'Can you cater for a mix of adults and children?',
                        answer: `Absolutely. We offer buffets, afternoon teas and sit-down meals, with a children's menu. ${PRIVATE_HIRE_DIETARY_WORDING} Let us know your numbers when you book.`,
                    },
                    {
                        question: 'How many guests can you host?',
                        answer: `${CAPACITY_LINE}. Tell us your guest count and we will recommend the right space.`,
                    },
                    {
                        question: 'Is the venue dog friendly?',
                        answer: DOGS_WORDING,
                    },
                    {
                        question: 'Is a deposit required?',
                        answer: `Yes. ${PRIVATE_HIRE_DEPOSIT_WORDING}`,
                    },
                ],
            }

        // No register office angle. It was removed on 8 October 2026 with the
        // type: its copy ("after your ceremony", "post-ceremony receptions")
        // read as weddings, and the last page it served was a hotel.

        case 'hospital':
            return {
                pageLabel: 'Team Events & Celebrations',
                crumb: `Event venue near ${name}`,
                lead: `An easy, relaxed venue for staff and family gatherings${away}`,
                badges: [...distanceBadge, 'Free Parking', 'Private Dining Room'],
                bookingContext: 'private_party',
                eventType: 'Other',
                intro: `Whether it is a leaving do, a team lunch, a baby shower or a get-together away from the ward, The Anchor gives staff and families near ${name} somewhere relaxed to gather. We${distance ? ` are ${distance} away and` : ''} have free parking. ${landmark.description}`,
                reasons: [
                    {
                        title: 'A short drive from the hospital',
                        content: `${distance ? `We are ${distance} from ${name}. ` : ''}${PARKING_WORDING}`,
                    },
                    {
                        title: 'Tell us your timings',
                        content: `Hospital teams keep all sorts of hours. ${PRIVATE_HIRE_TIMES_WORDING}`,
                    },
                ],
                narrative: {
                    heading: `Gatherings for teams and families near ${name}`,
                    paragraphs: [
                        `The Anchor is a traditional village pub ${isFrom}, ${HEATHROW_LINE}. We host leaving dos, retirement send-offs, team lunches, baby showers and family celebrations for staff and visitors who want a relaxed space away from the hospital.`,
                        `${DINING_ROOM_LINE}. You'll have ${COORDINATOR_LINE}, and there is free WiFi throughout, TVs and a sound system, and a dog-friendly garden.`,
                        `We know hospital schedules can be unpredictable, so tell us the times you have in mind. Choose from buffets, afternoon teas or a sit-down meal. Call us on ${CONTACT.phone} and we will help you arrange it.`,
                    ],
                },
                packagesHeading: 'Food and drinks for your gathering',
                packagesIntro: 'From finger buffets to afternoon teas and sit-down meals, plus drinks packages and unlimited tea and coffee, we will tailor the catering to your group. Room hire and catering are quoted on enquiry.',
                faqs: [
                    ...howFar(', an easy journey for staff finishing a shift or families marking an occasion.'),
                    {
                        question: 'Can you fit around hospital shift times?',
                        answer: PRIVATE_HIRE_TIMES_WORDING,
                    },
                    {
                        question: 'What kinds of events do you host?',
                        answer: 'We host leaving dos, retirement send-offs, team lunches, baby showers and family celebrations. Tell us what you are planning and we will help.',
                    },
                    {
                        question: 'Is there free parking?',
                        answer: PARKING_WORDING,
                    },
                    {
                        question: 'Do you have a private space?',
                        answer: PRIVATE_SPACE_ANSWER,
                    },
                    {
                        question: 'How many people can you cater for?',
                        answer: `${CAPACITY_LINE}. Let us know your numbers and we will recommend the right space.`,
                    },
                    {
                        question: PRIVATE_HIRE_DIETARY_QUESTION,
                        answer: PRIVATE_HIRE_DIETARY_WORDING,
                    },
                    {
                        question: 'Is a deposit required?',
                        answer: `Yes. ${PRIVATE_HIRE_DEPOSIT_WORDING}`,
                    },
                ],
            }

        case 'business_park':
            return {
                pageLabel: 'Corporate & Team Events',
                crumb: `Corporate venue near ${name}`,
                lead: `A relaxed off-site for meetings, lunches and team socials${away}`,
                badges: [...distanceBadge, 'Free WiFi', 'Free Parking', 'TVs & Sound System'],
                bookingContext: 'private_party',
                eventType: 'Other',
                intro: `Sometimes the best way to get a team talking is to get them out of the office. The Anchor is ${isFrom}, a relaxed village pub that makes an easy off-site for meetings, client lunches, team socials and end-of-quarter dinners. ${landmark.description}`,
                reasons: [
                    {
                        title: 'An easy off-site location',
                        content: `${reach} ${PARKING_LINE} and free WiFi throughout, so the team can drive over, park for free and get straight to it.`,
                    },
                    {
                        title: 'Equipped for working sessions',
                        content: SLIDESHOW_WORDING,
                    },
                ],
                narrative: {
                    heading: `An off-site venue near ${name}`,
                    paragraphs: [
                        `The Anchor is a traditional village pub ${isFrom}, ${HEATHROW_LINE}. It is an easy, professional yet relaxed alternative to the office canteen for away-days, client lunches, team socials and corporate dinners.`,
                        `${DINING_ROOM_LINE}. There is free WiFi throughout, TVs and a sound system for presentations (no projector), and ${COORDINATOR_LINE}.`,
                        `Choose from working lunches and finger buffets through to sit-down meals and drinks packages, and we will fit the day around your agenda. With free parking, it is a straightforward off-site for any team. ${ULEZ_WORDING} Call us on ${CONTACT.phone} to plan it.`,
                    ],
                },
                packagesHeading: 'Catering for the working day',
                packagesIntro: 'From working lunches and finger buffets to sit-down meals, drinks packages and unlimited tea and coffee, we will tailor the day to your team. Room hire and catering are quoted on enquiry.',
                faqs: [
                    ...howFar(', an easy off-site journey with free parking when the team arrives.'),
                    {
                        question: 'Is there free WiFi and somewhere to present?',
                        answer: `Yes. There is free WiFi throughout the venue. ${SLIDESHOW_WORDING}`,
                    },
                    {
                        question: 'What kinds of corporate events do you host?',
                        answer: 'We host away-days, working lunches, client lunches, team socials, end-of-quarter dinners and corporate Christmas parties. Tell us your plans and we will help.',
                    },
                    {
                        question: 'Is there free parking?',
                        answer: `${PARKING_WORDING} ${ULEZ_WORDING}`,
                    },
                    {
                        question: 'Do you have a private space for a meeting?',
                        answer: PRIVATE_SPACE_ANSWER,
                    },
                    {
                        question: 'How many people can you cater for?',
                        answer: `${CAPACITY_LINE}. Let us know your numbers and we will recommend the right space.`,
                    },
                    {
                        question: 'Can you provide a working lunch?',
                        answer: `Yes. We offer working lunches and finger buffets through to sit-down meals. ${PRIVATE_HIRE_DIETARY_WORDING}`,
                    },
                    {
                        question: 'Is a deposit required?',
                        answer: `Yes. ${PRIVATE_HIRE_DEPOSIT_WORDING}`,
                    },
                ],
            }

        case 'sports_venue':
            return {
                pageLabel: 'Club & Team Events',
                crumb: `Club venue near ${name}`,
                lead: `A relaxed spot for presentations, socials and committee dinners${away}`,
                badges: [...distanceBadge, 'Live Sport on Terrestrial TV', 'Free Parking', 'Garden & Dining Room'],
                bookingContext: 'private_party',
                eventType: 'Other',
                intro: `Every club needs somewhere to mark the season. The Anchor is ${isFrom}, a friendly village pub that makes an easy home for end-of-season dinners, presentation nights, committee meetings and supporter get-togethers. ${landmark.description}`,
                reasons: [
                    {
                        title: 'Free parking for the whole club',
                        content: `${reach} ${PARKING_LINE}, so players, families and supporters can park for free.`,
                    },
                    {
                        title: 'Set up for a club night',
                        content: `${SLIDESHOW_WORDING} There's the bar and the garden for the social side.`,
                    },
                ],
                narrative: {
                    heading: `A venue for club events near ${name}`,
                    paragraphs: [
                        `The Anchor is a traditional village pub ${isFrom}, ${HEATHROW_LINE}. We host end-of-season dinners, presentation nights, committee meetings, team socials and supporter meet-ups for local clubs and teams.`,
                        `${DINING_ROOM_LINE}. There are TVs and a sound system for presentations and awards (no projector), free WiFi throughout, and a dog-friendly garden. Live sport is shown on terrestrial channels only.`,
                        `Choose from buffets, sit-down meals and drinks packages. You'll have ${COORDINATOR_LINE}. With free parking and a relaxed, welcoming atmosphere, it is an easy choice for any club occasion. Call us on ${CONTACT.phone} to arrange it.`,
                    ],
                },
                packagesHeading: 'Food and drinks for the club',
                packagesIntro: 'From finger buffets to sit-down meals, drinks packages and unlimited tea and coffee, we will tailor the night to your club. Room hire and catering are quoted on enquiry.',
                faqs: [
                    ...howFar(', an easy journey for players, families and supporters, with free parking when you arrive.'),
                    {
                        question: 'Can we hold a presentation or awards night?',
                        answer: `Yes. ${SLIDESHOW_WORDING}`,
                    },
                    {
                        question: 'What kinds of club events do you host?',
                        answer: 'We host end-of-season dinners, presentation nights, committee meetings, team socials and supporter meet-ups. Tell us your plans and we will help.',
                    },
                    {
                        question: 'Do you show live sport?',
                        answer: SPORT_WORDING,
                    },
                    {
                        question: 'Is there free parking?',
                        answer: PARKING_WORDING,
                    },
                    {
                        question: 'How many people can you cater for?',
                        answer: `${CAPACITY_LINE}. Let us know your numbers and we will recommend the right space.`,
                    },
                    {
                        question: 'Can you cater for a large group?',
                        answer: `Yes. We offer buffets and sit-down meals for larger groups. ${PRIVATE_HIRE_DIETARY_WORDING} Let us know your numbers when you book.`,
                    },
                    {
                        question: 'Is a deposit required?',
                        answer: `Yes. ${PRIVATE_HIRE_DEPOSIT_WORDING}`,
                    },
                ],
            }

        // `other` (non-Heathrow) and any future type fall back to a general,
        // still-grounded private-hire angle. An `other` entry may have no
        // drive time (there is no figure we can stand behind), so every
        // sentence here reads without one and the "how far" answer is left out.
        default:
            return {
                pageLabel: 'Private Hire & Events',
                crumb: `Private hire near ${name}`,
                lead: distance ? `A flexible venue for your gathering, ${distance} away` : 'A flexible venue for your gathering',
                badges: [...(distance ? [`${distance} from ${name}`] : []), 'Free Parking', 'Private Dining Room', 'Dedicated Coordinator'],
                bookingContext: 'private_party',
                eventType: 'Other',
                intro: `Looking for a relaxed, welcoming venue near ${name}? The Anchor is ${distance ? `${distance} away, ` : ''}a traditional village pub with a private dining room and a beer garden, ideal for celebrations, gatherings and private events. ${landmark.description}`,
                reasons: [
                    {
                        title: 'Easy to reach, easy to park',
                        content: distance
                            ? `We are ${distance} from ${name}, with ${PARKING_LINE}, so your guests can arrive together and park for free.`
                            : `We have ${PARKING_LINE}, so your guests can arrive together and park for free.`,
                    },
                    {
                        title: 'Flexible spaces for any occasion',
                        content: 'From an intimate gathering in the dining room to a larger party across the venue, we have spaces to suit, with a garden for warmer days.',
                    },
                ],
                narrative: {
                    heading: `A private hire venue near ${name}`,
                    paragraphs: [
                        `The Anchor is a traditional village pub ${distance ? `${distance} from ${name}` : 'in Stanwell Moor'}, ${HEATHROW_LINE}. We host private parties, celebrations and gatherings of all kinds in a relaxed, welcoming setting.`,
                        `${DINING_ROOM_LINE}. You get ${COORDINATOR_LINE}, and there is free WiFi throughout, TVs and a sound system, and a dog-friendly garden.`,
                        `Choose from buffets, afternoon teas or a sit-down meal, plus drinks packages to suit. Call us on ${CONTACT.phone} and we will help you plan an event that fits the occasion.`,
                    ],
                },
                packagesHeading: 'Food and drinks for your event',
                packagesIntro: 'From finger buffets to afternoon teas and sit-down meals, plus drinks packages and unlimited tea and coffee, we will tailor the catering to your group. Room hire and catering are quoted on enquiry.',
                faqs: [
                    ...(distance
                        ? [
                              {
                                  question: `How far is The Anchor from ${name}?`,
                                  answer: `We are ${distance} from ${name}, an easy journey with free parking when you arrive.`,
                              },
                          ]
                        : []),
                    {
                        question: 'Is there free parking?',
                        answer: PARKING_WORDING,
                    },
                    {
                        question: 'Do you have a private space?',
                        answer: PRIVATE_SPACE_ANSWER,
                    },
                    {
                        question: 'How many people can you cater for?',
                        answer: `${CAPACITY_LINE}. Let us know your numbers and we will recommend the right space.`,
                    },
                    {
                        question: 'What kinds of events do you host?',
                        answer: 'We host private parties, celebrations, family gatherings and corporate events.',
                    },
                    {
                        question: PRIVATE_HIRE_DIETARY_QUESTION,
                        answer: PRIVATE_HIRE_DIETARY_WORDING,
                    },
                    {
                        question: 'Is the venue dog friendly?',
                        answer: DOGS_WORDING,
                    },
                    {
                        question: 'Is a deposit required?',
                        answer: `Yes. ${PRIVATE_HIRE_DEPOSIT_WORDING}`,
                    },
                ],
            }
    }
}

// Which landmark types may be listed together under "Other venues near you".
// Wake venues stand alone: a christening, business or club page must never be
// padded out with crematoria and cemeteries, and a wake page lists only those.
const RELATED_TYPES: Record<LandmarkType, LandmarkType[]> = {
    crematorium: ['crematorium'],
    church: ['church'],
    hospital: ['hospital', 'business_park', 'other'],
    business_park: ['business_park', 'hospital', 'other'],
    sports_venue: ['sports_venue', 'other'],
    other: ['other', 'business_park', 'sports_venue', 'hospital'],
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
            return { label: 'Christening Venue', descriptor: 'christenings, naming days and family celebrations' }
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
    const title = `${label} Near ${landmark.name}`
    // Kept under 160 characters so it is not truncated in results. The old
    // version interpolated the full `descriptor` list and ran to 225.
    // `where` carries the drive time when the entry has one, and says only
    // "near" when it does not.
    const where = whereFrom(landmark) ?? `near ${landmark.name}`
    const description = `${label} ${where}. Free parking, private space for ${PRIVATE_HIRE_CAPACITY.recommendedRange} and someone to help you plan it.`

    return {
        title,
        description,
        openGraph: {
            title: `${label} Near ${landmark.name} | The Anchor Stanwell Moor`,
            description: `A welcoming venue for ${descriptor}, ${where}. Free parking and flexible private spaces.`,
            images: [{ url: DEFAULT_CORPORATE_IMAGE, width: 1200, height: 630, alt: 'Private hire venue at The Anchor near Heathrow Airport' }],
        },
        twitter: getTwitterMetadata({
            title: `${label} Near ${landmark.name} | The Anchor Stanwell Moor`,
            description: `A welcoming venue for ${descriptor}, ${where}.`,
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

    // Cross-link only to landmarks for the same kind of occasion (RELATED_TYPES),
    // so a christening or club page never lists crematoria and cemeteries.
    const relatedLandmarks = landmarks.filter(
        (l) => l.slug !== landmark.slug && RELATED_TYPES[landmark.type].includes(l.type)
    )

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
        description: `A flexible private hire venue for ${angle.pageLabel.toLowerCase()}, ${whereFrom(landmark) ?? `near ${landmark.name}`}.`,
        maximumAttendeeCapacity: mainArea.standing,
        amenityFeature: [
            { '@type': 'LocationFeatureSpecification', name: 'Free Parking', value: true },
            { '@type': 'LocationFeatureSpecification', name: 'Private Dining Room', value: true },
            ...ACCESS_AMENITY_FEATURES,
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
                            <Badge key={b} variant="sand" wrap>{b}</Badge>
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
                    <div className="mx-auto text-center">
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
                <Container>
                    <SectionHeading title={angle.narrative.heading} />
                    <div className="mx-auto space-y-4 text-ink-muted">
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
                        title={landmark.distance && landmark.slug !== 'heathrow-airport' ? `Just ${landmark.distance} Away` : 'How to Find Us'}
                        script="Easy to find, easy to park"
                    />
                    <div className="mx-auto h-[400px] rounded-md overflow-hidden shadow-md">
                        <GoogleMapEmbed query={`The Anchor Stanwell Moor near ${landmark.name}`} />
                    </div>
                    <div className="text-center mt-6">
                        <DirectionsButton
                            href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(landmark.address)}&destination=The+Anchor+Stanwell+Moor+TW19+6AQ`}
                            source="private_hire_near_directions"
                            fromLocation={landmark.name}
                            variant="outline"
                            wrap
                        >
                            Get Directions from {landmark.name}
                        </DirectionsButton>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <SectionHeading title={angle.packagesHeading} />
                    <p className="mx-auto text-center text-ink-muted mb-8">
                        {angle.packagesIntro}
                    </p>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            { title: 'Catering', description: `Buffets, afternoon teas, or sit-down meals tailored to your requirements. ${PRIVATE_HIRE_DIETARY_WORDING}` },
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

            <BrochureDownload brochure="general" source="private_hire_near" />

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
                    description: l.distance ?? l.address,
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
