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
 * road-tested. The per-landmark times below are not in the SSOT table and have
 * no independent source.
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
    // e.g., "7 mins drive". Left out when there is no figure we can stand
    // behind; only an `other` entry may leave it out (the page copes).
    distance?: string;
    googleMapsUrl?: string; // Optional direct link
    description: string; // Specific copy about the connection (e.g., "Easily accessible via A30")
}

export const landmarks: Landmark[] = [
    // Crematoriums & Cemeteries
    {
        slug: 'south-west-middlesex-crematorium',
        name: 'South West Middlesex Crematorium',
        type: 'crematorium',
        address: 'Hounslow Road, Feltham TW13 5JH',
        distance: '10 mins drive',
        description: 'Located just a short drive away, The Anchor provides a peaceful and respectful setting for post-service gatherings. We are easily accessible via the A30 and perimeter roads.'
    },
    {
        slug: 'staines-cemetery',
        name: 'Staines Cemetery',
        type: 'crematorium',
        address: 'London Road, Staines-upon-Thames TW18 4AJ',
        distance: '8 mins drive',
        description: 'A convenient and quiet location for families gathering after services at Staines Cemetery. Our private rooms offer a secluded space for reflection.'
    },
    {
        slug: 'slough-crematorium',
        name: 'Slough Cemetery and Crematorium',
        type: 'crematorium',
        address: 'Stoke Road, Slough SL2 5AX',
        distance: '15 mins drive',
        description: 'We welcome families from Slough Crematorium looking for a quality venue with ample free parking and flexible catering options.'
    },

    // Churches
    {
        slug: 'st-mary-the-virgin-stanwell',
        name: 'St Mary the Virgin, Stanwell',
        type: 'church',
        address: 'Church Road, Stanwell TW19 7HF',
        distance: '4 mins drive',
        description: 'We are the perfect neighbour for St Mary\'s, located just minutes away in Stanwell Moor. Ideal for christening receptions and post-service meals.'
    },
    {
        slug: 'our-lady-of-the-rosary-staines',
        name: 'Our Lady of the Rosary RC Church',
        type: 'church',
        address: '59 Gresham Road, Staines TW18 2BD',
        distance: '8 mins drive',
        description: 'After your ceremony at Our Lady of the Rosary, gather your friends and family at The Anchor for a celebratory meal or buffet.'
    },
    {
        slug: 'st-johns-church-egham',
        name: 'St John\'s Church, Egham',
        type: 'church',
        address: 'Manor Farm Lane, Egham TW20 9HL',
        distance: '10 mins drive',
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
        distance: '8 mins drive',
        description: 'Conveniently located for medical teams and hospital staff looking for a venue for leaving dos, baby showers, or team lunches.'
    },

    // Business Parks
    {
        slug: 'bedfont-lakes',
        name: 'Bedfont Lakes Business Park',
        type: 'business_park',
        address: 'Bedfont Lakes, Feltham TW14 8HA',
        distance: '8 mins drive',
        description: 'Escape the office park canteen. We offer a professional yet relaxed environment for team meetings, client lunches, and corporate dinners.'
    },
    {
        slug: 'stockley-park',
        name: 'Stockley Park',
        type: 'business_park',
        address: 'Uxbridge UB11 1AQ',
        distance: '12 mins drive',
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
        distance: '7 mins drive',
        description: 'The Anchor is 7 minutes from Heathrow Terminal 5, ideal for airport staff events, farewell dinners, and gatherings for those travelling or arriving at Heathrow.'
    },

    // Sports Venues
    {
        slug: 'staines-rugby-club',
        name: 'Staines Rugby Football Club',
        type: 'sports_venue',
        address: 'Snakey Lane, Feltham TW13 7NB',
        distance: '10 mins drive',
        description: 'The perfect spot for end-of-season dinners, committee meetings, or team socials near Staines RFC.'
    },
    {
        slug: 'ashford-town-fc',
        name: 'Ashford Town (Middx) FC',
        type: 'sports_venue',
        address: 'Short Lane, Stanwell TW19 7BH',
        distance: '6 mins drive',
        description: 'Just down the road from the club, we host team presentations, supporter meet-ups, and committee dinners.'
    }
];

export function getLandmarkBySlug(slug: string): Landmark | undefined {
    return landmarks.find(l => l.slug === slug);
}

export function getLandmarksByType(type: LandmarkType): Landmark[] {
    return landmarks.filter(l => l.type === type);
}
