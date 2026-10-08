import { HEATHROW_TIMES, WAKE_VENUE_DRIVE_MINUTES } from '@/lib/constants'
/**
 * verifiedAt: '2026-08-26'  Owner: Peter Pitcher.
 *
 * Checked against the distance table in docs/SSOT.md §2, which is canonical
 * per CLAUDE.md ("The SSOT wins. If existing page copy disagrees with the
 * SSOT, the page is wrong"). Terminal 5 seven minutes, Terminals 2 and 3
 * eleven, Terminal 4 twelve, Staines eight.
 *
 * Every terminal and Staines claim across app/ and lib/ was compared against
 * that table. One real contradiction was found and corrected: /stanwell-pub
 * claimed fifteen minutes from Staines against the SSOT's eight and four other
 * pages agreeing with the SSOT.
 *
 * NOT verified against a live mapping service. The Google key in this project
 * has neither billing enabled (server key) nor permission for Routes or
 * Distance Matrix (browser key is referer-restricted), so "7 minutes" is
 * verified as INTERNALLY CONSISTENT AND SSOT-BACKED, not as independently
 * road-tested.
 *
 * 8 October 2026: a landmark carries a drive time only where docs/SSOT.md gives
 * one (the three wake venues in section 11, read from WAKE_VENUE_DRIVE_MINUTES,
 * and the terminal table in section 2). The other per-landmark times had no
 * source and are gone. tests/one-home-for-facts-guard.test.ts holds this.
 */
// There is no register office type. The last entry that used it was a hotel,
// and the three real register office pages were retired on 8 October 2026.
// Its page copy talked about "your ceremony" and "receptions", which reads as
// weddings: a thing we take on enquiry but do not market (docs/SSOT.md §14).
export type LandmarkType = 'crematorium' | 'church' | 'hospital' | 'business_park' | 'sports_venue' | 'other';

export interface Landmark {
    slug: string;
    name: string;
    type: LandmarkType;
    address: string;
    // e.g., "10 mins drive". Only a landmark the SSOT gives a drive time for
    // has one (section 11, "Nearby venues for wakes", and the terminal table in
    // section 2). Every other landmark leaves it out, and the page copes.
    distance?: string;
    googleMapsUrl?: string; // Optional direct link
    description: string; // Specific copy about the connection (e.g., "Easily accessible via A30")
}

/** The SSOT's drive time for a wake venue, in the words the page prints. */
function wakeVenueDistance(slug: string): string {
    return `${WAKE_VENUE_DRIVE_MINUTES[slug]} mins drive`;
}

export const landmarks: Landmark[] = [
    // Crematoriums & Cemeteries
    {
        slug: 'south-west-middlesex-crematorium',
        name: 'South West Middlesex Crematorium',
        type: 'crematorium',
        address: 'Hounslow Road, Feltham TW13 5JH',
        distance: wakeVenueDistance('south-west-middlesex-crematorium'),
        description: 'Located just a short drive away, The Anchor provides a peaceful and respectful setting for post-service gatherings.'
    },
    {
        slug: 'staines-cemetery',
        name: 'Staines Cemetery',
        type: 'crematorium',
        address: 'London Road, Staines-upon-Thames TW18 4AJ',
        distance: wakeVenueDistance('staines-cemetery'),
        description: 'A convenient and quiet location for families gathering after services at Staines Cemetery. Our private rooms offer a secluded space for reflection.'
    },
    {
        slug: 'slough-crematorium',
        name: 'Slough Cemetery and Crematorium',
        type: 'crematorium',
        address: 'Stoke Road, Slough SL2 5AX',
        distance: wakeVenueDistance('slough-crematorium'),
        description: 'We welcome families from Slough Crematorium looking for a quality venue with free parking and flexible catering options.'
    },

    // Churches
    {
        slug: 'st-mary-the-virgin-stanwell',
        name: 'St Mary the Virgin, Stanwell',
        type: 'church',
        address: 'Church Road, Stanwell TW19 7HF',
        description: 'We are the perfect neighbour for St Mary\'s, located just minutes away in Stanwell Moor. Ideal for christening receptions and post-service meals.'
    },
    {
        slug: 'our-lady-of-the-rosary-staines',
        name: 'Our Lady of the Rosary RC Church',
        type: 'church',
        address: '59 Gresham Road, Staines TW18 2BD',
        description: 'After your ceremony at Our Lady of the Rosary, gather your friends and family at The Anchor for a celebratory meal or buffet.'
    },
    {
        slug: 'st-johns-church-egham',
        name: 'St John\'s Church, Egham',
        type: 'church',
        address: 'Manor Farm Lane, Egham TW20 9HL',
        description: 'A short drive from Egham, offering a relaxed and welcoming atmosphere for church events and family celebrations.'
    },

    // Hotels
    // Great Fosters is a hotel, not a register office (owner, 8 October 2026).
    // No drive time: "12 mins drive" was not in docs/SSOT.md and had no source.
    // No "day-after brunch": it implied a wedding the day before, and brunch
    // is not something the SSOT says we serve.
    {
        slug: 'great-fosters-egham',
        name: 'Great Fosters',
        type: 'other',
        address: 'Stroude Road, Egham TW20 9UR',
        description: 'Great Fosters is a hotel in Egham. We are a relaxed village pub for a family meal or a get-together, with free parking for all guests.'
    },

    // Hospitals
    {
        slug: 'ashford-hospital',
        name: 'Ashford Hospital',
        type: 'hospital',
        address: 'London Road, Ashford TW15 3AA',
        description: 'Conveniently located for medical teams and hospital staff looking for a venue for leaving dos, baby showers, or team lunches.'
    },

    // Business Parks
    {
        slug: 'bedfont-lakes',
        name: 'Bedfont Lakes Business Park',
        type: 'business_park',
        address: 'Bedfont Lakes, Feltham TW14 8HA',
        description: 'Escape the office park canteen. We offer a professional yet relaxed environment for team meetings, client lunches, and corporate dinners.'
    },
    {
        slug: 'stockley-park',
        name: 'Stockley Park',
        type: 'business_park',
        address: 'Uxbridge UB11 1AQ',
        description: 'Accessible via the M25 and local roads, we provide a great off-site location for Stockley Park businesses.'
    },

    // Removed on 8 October 2026 (owner decision 15, site review finding C1-006):
    // kempton-park-crematorium and spelthorne-registration-office (neither place
    // exists), staines-registration-office (births and deaths only, no
    // ceremonies) and windsor-register-office (the office is in Maidenhead).
    // Each address redirects: see config/redirects/additional-redirects.json.
    // Do not add them back without the council's own page as a source.

    // Airports
    {
        slug: 'heathrow-airport',
        name: 'Heathrow Airport',
        type: 'other',
        address: 'Heathrow Airport TW6',
        // The Terminal 5 time is not the time to the whole airport.
        distance: `${HEATHROW_TIMES.terminal5} to ${HEATHROW_TIMES.terminal4} mins drive, depending on the terminal`,
        description: `The Anchor is ${HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5, ideal for airport staff events, farewell dinners, and gatherings for those travelling or arriving at Heathrow.`
    },

    // Sports Venues
    {
        slug: 'staines-rugby-club',
        name: 'Staines Rugby Football Club',
        type: 'sports_venue',
        address: 'Snakey Lane, Feltham TW13 7NB',
        description: 'The perfect spot for end-of-season dinners, committee meetings, or team socials near Staines RFC.'
    },
    {
        slug: 'ashford-town-fc',
        name: 'Ashford Town (Middx) FC',
        type: 'sports_venue',
        address: 'Short Lane, Stanwell TW19 7BH',
        description: 'Just down the road from the club, we host team presentations, supporter meet-ups, and committee dinners.'
    }
];

export function getLandmarkBySlug(slug: string): Landmark | undefined {
    return landmarks.find(l => l.slug === slug);
}

export function getLandmarksByType(type: LandmarkType): Landmark[] {
    return landmarks.filter(l => l.type === type);
}
