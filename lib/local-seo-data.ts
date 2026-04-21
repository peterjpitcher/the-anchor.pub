export type LandmarkType = 'crematorium' | 'church' | 'registry_office' | 'hospital' | 'business_park' | 'sports_venue' | 'other';

export interface Landmark {
    slug: string;
    name: string;
    type: LandmarkType;
    address: string;
    distance: string; // e.g., "7 mins drive"
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

    // Registry Offices & Wedding Venues
    {
        slug: 'staines-registration-office',
        name: 'Staines Registration Office',
        type: 'registry_office',
        address: 'The Library, Friends Walk, Staines TW18 4PG',
        distance: '9 mins drive',
        description: 'Avoid the town centre parking hassle. Come to The Anchor after your registry office ceremony for a relaxed wedding lunch or dinner with free parking for all guests.'
    },
    {
        slug: 'great-fosters-egham',
        name: 'Great Fosters',
        type: 'registry_office', // Using generic type for wedding venue ecosystem
        address: 'Stroude Road, Egham TW20 9UR',
        distance: '12 mins drive',
        description: 'Planning a wedding at Great Fosters? We are the ideal location for your rehearsal dinner, pre-wedding family meal, or day-after brunch.'
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

    // Additional Crematoriums
    {
        slug: 'kempton-park-crematorium',
        name: 'Kempton Park Crematorium',
        type: 'crematorium',
        address: 'Feltham Road, Hanworth TW13 4LY',
        distance: '12 mins drive',
        description: 'The Anchor offers a private, peaceful setting for families gathering after services at Kempton Park Crematorium — a straightforward 12-minute drive via the A316.'
    },

    // Additional Registry Offices
    {
        slug: 'windsor-register-office',
        name: 'Windsor Register Office',
        type: 'registry_office',
        address: 'King Edward Court, Windsor SL4 1DT',
        distance: '20 mins drive',
        description: 'After your ceremony at Windsor Register Office, The Anchor provides a relaxed venue for a celebratory meal or drinks reception, with free parking for all guests.'
    },
    {
        slug: 'spelthorne-registration-office',
        name: 'Spelthorne Registration Office',
        type: 'registry_office',
        address: 'Knowle Green, Staines TW18 1XB',
        distance: '9 mins drive',
        description: 'Just 9 minutes from Spelthorne Registration Office, The Anchor is perfectly placed for wedding breakfasts, naming ceremonies, and post-registration celebrations.'
    },

    // Airports
    {
        slug: 'heathrow-airport',
        name: 'Heathrow Airport',
        type: 'other',
        address: 'Heathrow Airport TW6',
        distance: '7 mins drive',
        description: 'The Anchor is 7 minutes from Heathrow Terminal 5 — ideal for airport staff events, farewell dinners, and gatherings for those travelling or arriving at Heathrow.'
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
