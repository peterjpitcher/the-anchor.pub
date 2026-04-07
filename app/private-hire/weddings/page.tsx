import Link from 'next/link'
import { Metadata } from 'next'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { Container, SectionHeader, FeatureGrid, Button, InfoBoxGrid } from '@/components/ui'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_CORPORATE_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { landmarks } from '@/lib/local-seo-data'
import { PrivateBookingSection } from '@/components/PrivateBookingSection'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'

export const metadata: Metadata = {
    title: 'Wedding Venue Near Heathrow | Receptions & Engagements | The Anchor',
    description: 'The perfect venue near Staines Registry Office an Great Fosters for engagement parties, rehearsal dinners, and relaxed wedding receptions. Free parking.',
    openGraph: {
        title: 'Wedding Venue Near Heathrow | The Anchor Stanwell Moor',
        description: 'Relaxed wedding celebrations, engagement parties, and day-after brunches.',
        images: [{ url: DEFAULT_CORPORATE_IMAGE, width: 1200, height: 630, alt: 'Private hire venue at The Anchor near Heathrow Airport' }],
    },
    twitter: getTwitterMetadata({
        title: 'Wedding Venue Near Heathrow | The Anchor Stanwell Moor',
        description: 'Relaxed wedding celebrations, engagement parties, and day-after brunches.',
        images: [DEFAULT_CORPORATE_IMAGE]
    }),
    alternates: {
        canonical: '/private-hire/weddings'
    }
}

const nearbyWeddingVenues = landmarks.filter(l => l.type === 'registry_office');

export default function WeddingsPage() {
    return (
        <>
            <BreadcrumbJsonLd items={[
                { name: 'Home', url: '/' },
                { name: 'Private Hire', url: '/private-hire' },
                { name: 'Weddings', url: '/private-hire/weddings' }
            ]} />

            <HeroWrapper
                route="/private-hire/weddings"
                variant="feature"
                title="Weddings & Engagements"
                description="Relaxed celebrations for the modern couple"
               
                tags={[
                    { label: "Engagement Parties", variant: "default" },
                    { label: "Rehearsal Dinners", variant: "success" },
                    { label: "Near Registry Office", variant: "default" },
                    { label: "Day-After Brunch", variant: "success" }
                ]}
                primaryCta={
                    <BookTableButton
                        source="weddings_hero"
                        variant="primary"
                        size="lg"
                        context="wedding"
                    >
                        Enquire Now
                    </BookTableButton>
                }
                secondaryCta={
                    <PhoneButton
                        phone="01753 682707"
                        source="weddings_hero"
                        variant="secondary"
                        size="lg"
                    >
                        Call 01753 682707
                    </PhoneButton>
                }
                secondaryInfo={
                    <div className="flex flex-wrap justify-center gap-x-2 gap-y-2 mt-2">
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Free parking · 20 spaces</span>
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">7 min from Heathrow T5</span>
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Dog &amp; family friendly</span>
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Super-fast fibre broadband</span>
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">10–200 guests</span>
                    </div>
                }
            />

            <section className="py-12 bg-anchor-bg-card border-b border-anchor-gold/15">
                <Container>
                    <PageTitle className="text-center mb-6" seo={{ structured: true, speakable: true }}>
                        Wedding Venue Near Heathrow — Not Your Typical Reception
                    </PageTitle>
                    <div className="max-w-3xl mx-auto text-center">
                        <p className="text-lg text-anchor-cream-text/70 mb-8">
                            We specialise in the celebrations <strong>around</strong> the big day. Whether it's a lively engagement party, a relaxed dinner after a registry office ceremony, or a 'day-after' brunch to say goodbye to out-of-town guests.
                        </p>

                        <div className="bg-anchor-bg-raised p-6 rounded-xl inline-block text-left w-full border border-anchor-gold/15">
                            <h3 className="font-bold text-anchor-gold-vivid mb-3 text-center">Perfectly Located Near</h3>
                            <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
                                {nearbyWeddingVenues.map(l => (
                                    <li key={l.slug} className="flex items-center gap-2">
                                        <span className="text-anchor-gold"></span>
                                        <Link href={`/private-hire/near/${l.slug}`} className="hover:underline text-anchor-cream-text/70 font-medium">
                                            {l.name} ({l.distance})
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
                <Container>
                    <SectionHeader
                        title="Celebration Options"
                    />
                    <FeatureGrid
                        columns={2}
                        features={[
                            {
                                icon: "",
                                title: "Engagement Parties",
                                description: "Kick off your journey with a bang. DJ, dancing, buffet, and a private bar for up to 80 guests.",
                                className: "text-center"
                            },
                            {
                                icon: "",
                                title: "Rehearsal Dinners",
                                description: "Get the families together before the big day. A relaxed 3-course meal to break the ice.",
                                className: "text-center"
                            },
                            {
                                icon: "",
                                title: "Post-Registry Lunch",
                                description: "After the 'I dos' at Staines Registry Office, head over for a celebratory lunch without the formality of a reception.",
                                className: "text-center"
                            },
                            {
                                icon: "",
                                title: "Day-After Brunch",
                                description: "The perfect debrief. Bloody Marys, a relaxed lunch, and swapping stories from the night before.",
                                className: "text-center"
                            }
                        ]}
                    />
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg-card border-t border-anchor-gold/15">
                <Container>
                    <SectionHeader
                        title="Make It Yours"
                        subtitle="Flexible packages to suit your style"
                    />
                    <InfoBoxGrid
                        columns={3}
                        boxes={[
                            {
                                title: "Drinks Packages",
                                content: "Arrival Prosecco, beer buckets on tables, or a full open bar tab. We can tailor the drink options to your budget.",
                                variant: "default"
                            },
                            {
                                title: "Decorations",
                                content: "Bring your own balloons, photo walls, and table centers. We just provide the blank canvas for your theme.",
                                variant: "default"
                            },
                            {
                                title: "Entertainment",
                                content: "Connect your Spotify playlist to our sound system or bring your favourite DJ to get the party started.",
                                variant: "default"
                            }
                        ]}
                    />
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
                <Container>
                    <SectionHeader
                        title="Near Staines Registration Office"
                        subtitle="The perfect pub wedding reception after a registry ceremony"
                    />
                    <div className="prose prose-invert max-w-3xl mx-auto">
                        <p className="text-anchor-cream-text/70 mb-4">
                            Staines Registration Office on Kingston Road is one of the most popular spots for civil ceremonies in the Spelthorne area. If you are planning a small, intimate wedding there, The Anchor is ideally placed for the reception that follows. We are less than 10 minutes away by car, and our relaxed setting is the perfect antidote to the formality of the ceremony itself.
                        </p>
                        <p className="text-anchor-cream-text/70 mb-4">
                            A pub wedding reception at The Anchor is not about top tables, table plans, or formal speeches (unless you want them). It is about gathering your favourite people, sharing good food and drink, and celebrating the fact that you just got married. Many couples tell us that the pub reception was the highlight of their day — the moment everyone finally relaxed and the real celebration began.
                        </p>
                        <p className="text-anchor-cream-text/70 mb-4">
                            We can reserve our private dining room for your party, set up a drinks reception for when you arrive, and arrange a buffet or sit-down meal depending on your preference. If you want to give a speech, plug in a playlist, or even arrange a first dance, we can make it happen. But there is no pressure to follow the traditional wedding reception format — this is your celebration, your way.
                        </p>
                        <p className="text-anchor-cream-text/70">
                            For couples travelling from further afield, our location near Heathrow Airport means guests can fly in and find hotels easily. There are dozens of hotels within a five-minute drive, from budget options to four-star comfort. This makes us a practical small wedding venue for Heathrow-area celebrations where guests are arriving from different parts of the country — or the world.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg-card border-b border-anchor-gold/15">
                <Container>
                    <SectionHeader
                        title="Intimate Pub Wedding Receptions"
                        subtitle="Small celebrations done properly"
                    />
                    <div className="prose prose-invert max-w-3xl mx-auto mb-8">
                        <p className="text-anchor-cream-text/70 mb-4">
                            Not every wedding needs 200 guests and a ballroom. More and more couples are choosing small, meaningful celebrations — a registry office ceremony followed by a long lunch or evening party at a pub they love. If that sounds like you, The Anchor Pub is exactly the kind of venue you are looking for.
                        </p>
                        <p className="text-anchor-cream-text/70 mb-4">
                            We specialise in wedding celebrations for 10 to 60 guests. Our private dining room provides an intimate, self-contained space where you can eat, drink, and celebrate without feeling lost in a cavernous function room. For larger parties of up to 80, we can extend into the main bar area or reserve additional space to suit your needs.
                        </p>
                        <p className="text-anchor-cream-text/70 mb-4">
                            What makes a pub wedding reception special is the atmosphere. There is a warmth and character to celebrating in a proper pub that you simply cannot replicate in a hotel conference room. The exposed beams, the real fire in winter, the beer garden in summer — these are the details that make your wedding photos look and feel different from everyone else&apos;s.
                        </p>
                        <p className="text-anchor-cream-text/70">
                            Whether you have just come from Staines Registration Office, a local church, or even a destination ceremony abroad and want to throw a UK celebration, we will make your pub wedding reception feel exactly as it should — personal, joyful, and completely yours.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
                <Container>
                    <SectionHeader
                        title="Wedding Reception Packages"
                        subtitle="Flexible options for every style of celebration"
                    />
                    <div className="max-w-4xl mx-auto">
                        <div className="grid md:grid-cols-3 gap-6 mb-8">
                            <div className="card-dark rounded-none p-8 text-center">
                                <h3 className="text-xl font-bold text-anchor-gold-vivid mb-2">Buffet Reception</h3>
                                <p className="text-2xl font-bold text-anchor-cream-text mb-1">From £14.95<span className="text-sm font-normal text-anchor-cream-text/55">/person</span></p>
                                <p className="text-anchor-cream-text/55 mb-4 italic">Relaxed and sociable</p>
                                <p className="text-anchor-cream-text/70 mb-4">A generous buffet spread that lets guests mingle and eat at their own pace. The most popular choice for pub wedding receptions where the mood is informal and celebratory.</p>
                                <ul className="text-sm text-anchor-cream-text/55 space-y-1 text-left">
                                    <li>Hot &amp; cold buffet items</li>
                                    <li>Vegetarian &amp; dietary options</li>
                                    <li>Wedding cake cutting service</li>
                                    <li>Tea, coffee &amp; biscuits</li>
                                </ul>
                            </div>

                            <div className="card-dark rounded-none p-8 text-center border-2 border-anchor-gold/30">
                                <h3 className="text-xl font-bold text-anchor-gold-vivid mb-2">Sit-Down Meal</h3>
                                <p className="text-2xl font-bold text-anchor-cream-text mb-1">From £24.95<span className="text-sm font-normal text-anchor-cream-text/55">/person</span></p>
                                <p className="text-anchor-cream-text/55 mb-4 italic">A touch of formality</p>
                                <p className="text-anchor-cream-text/70 mb-4">A two or three-course meal served at the table. Perfect if you want the structure of a traditional wedding breakfast but in a more relaxed setting.</p>
                                <ul className="text-sm text-anchor-cream-text/55 space-y-1 text-left">
                                    <li>2 or 3 courses</li>
                                    <li>Choice of mains</li>
                                    <li>Pre-order service for larger groups</li>
                                    <li>Dedicated waiting staff</li>
                                </ul>
                            </div>

                            <div className="card-dark rounded-none p-8 text-center">
                                <h3 className="text-xl font-bold text-anchor-gold-vivid mb-2">Evening Party</h3>
                                <p className="text-2xl font-bold text-anchor-cream-text mb-1">Min. spend applies</p>
                                <p className="text-anchor-cream-text/55 mb-4 italic">For after-parties and celebrations</p>
                                <p className="text-anchor-cream-text/70 mb-4">Reserve a space for an evening celebration with drinks, music, and a late-night buffet. Ideal for couples who have had their main reception elsewhere and want a more casual after-party.</p>
                                <ul className="text-sm text-anchor-cream-text/55 space-y-1 text-left">
                                    <li>Reserved area or private room</li>
                                    <li>Sound system for music/DJ</li>
                                    <li>Bar tab or pay-as-you-go</li>
                                    <li>Late-night buffet options</li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-anchor-bg-raised border border-anchor-gold/15 rounded-xl p-6 text-center">
                            <p className="text-anchor-cream-text/70 text-sm">
                                All wedding reception packages include use of a reserved area, dedicated staff, setup and cleardown, and free parking. Drinks packages (Prosecco reception, beer buckets, open bar tab) can be added to any option. Call us on <strong className="text-anchor-gold-vivid">01753 682707</strong> for a bespoke quote.
                            </p>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg-card border-b border-anchor-gold/15">
                <Container>
                    <SectionHeader
                        title="What Couples Say"
                        subtitle="From recent wedding celebrations at The Anchor"
                    />
                    <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
                        <div className="bg-anchor-bg-raised border border-anchor-gold/15 rounded-xl p-6">
                            <p className="text-anchor-cream-text/70 italic mb-4">&ldquo;We got married at Staines Registry Office and came straight to The Anchor for lunch with 30 of our closest friends. It was exactly what we wanted — no fuss, great food, and a proper celebration. The staff even had Prosecco waiting when we walked through the door.&rdquo;</p>
                            <p className="text-sm text-anchor-gold-vivid font-semibold">— Laura &amp; Mike, Staines</p>
                        </div>
                        <div className="bg-anchor-bg-raised border border-anchor-gold/15 rounded-xl p-6">
                            <p className="text-anchor-cream-text/70 italic mb-4">&ldquo;We had our main wedding abroad and threw a pub wedding reception at The Anchor for all the friends and family who could not make the trip. The buffet was brilliant, the music was perfect, and the atmosphere was exactly right. Better than any hotel function room.&rdquo;</p>
                            <p className="text-sm text-anchor-gold-vivid font-semibold">— Sophie &amp; James, Ashford</p>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
                <Container>
                    <SectionHeader
                        title="Planning Your Wedding Celebration"
                        subtitle="A step-by-step guide"
                    />
                    <div className="max-w-3xl mx-auto">
                        <ol className="space-y-6">
                            <li className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-anchor-gold-vivid text-anchor-dark font-bold flex items-center justify-center text-sm">1</span>
                                <div>
                                    <h3 className="font-bold text-anchor-cream-text mb-1">Get in touch early</h3>
                                    <p className="text-anchor-cream-text/70">Call us on 01753 682707 or use the enquiry form below. For weekend wedding receptions, we recommend booking 4 to 8 weeks in advance. Weekday celebrations are often available at shorter notice.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-anchor-gold-vivid text-anchor-dark font-bold flex items-center justify-center text-sm">2</span>
                                <div>
                                    <h3 className="font-bold text-anchor-cream-text mb-1">Choose your format</h3>
                                    <p className="text-anchor-cream-text/70">Decide whether you want a buffet, sit-down meal, or evening party. We will walk you through the options, discuss drinks packages, and help you plan the flow of the day.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-anchor-gold-vivid text-anchor-dark font-bold flex items-center justify-center text-sm">3</span>
                                <div>
                                    <h3 className="font-bold text-anchor-cream-text mb-1">Add your personal touches</h3>
                                    <p className="text-anchor-cream-text/70">Bring decorations, a photo wall, a wedding cake, and your Spotify playlist. We provide the blank canvas and the sound system — you add the personality.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-anchor-gold-vivid text-anchor-dark font-bold flex items-center justify-center text-sm">4</span>
                                <div>
                                    <h3 className="font-bold text-anchor-cream-text mb-1">Celebrate</h3>
                                    <p className="text-anchor-cream-text/70">On the day, everything will be ready for you. Walk in, be greeted with drinks, and enjoy the party. We handle the rest — from setup to final cleardown.</p>
                                </div>
                            </li>
                        </ol>
                    </div>
                </Container>
            </section>

            <PrivateBookingSection eventType="Wedding Reception" />

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "How many guests can you accommodate for a wedding reception?",
                        answer: "We can host intimate dinners for 10 up to parties of 80 in our private dining room. For exclusive venue hire, we can accommodate up to 200 guests across the whole pub."
                    },
                    {
                        question: "Do you have a late license?",
                        answer: "Our standard license runs until 11pm (11:30pm Fri/Sat), but extensions can be arranged for private wedding parties upon request."
                    },
                    {
                        question: "Is there anywhere for guests to stay nearby?",
                        answer: "Yes, being near Heathrow means there are dozens of hotels within a 5-minute drive, catering to all budgets. From Premier Inn and Travelodge to four-star options, your guests will have no trouble finding somewhere to stay."
                    },
                    {
                        question: "How far is The Anchor from Staines Registration Office?",
                        answer: "We are less than 10 minutes by car from Staines Registration Office on Kingston Road. Many couples come directly to The Anchor after their ceremony for a relaxed pub wedding reception."
                    },
                    {
                        question: "Can we bring a wedding cake?",
                        answer: "Absolutely. You are welcome to bring your own wedding cake and we will store it safely until you are ready to cut it. We will provide a cake knife, plates, and napkins."
                    },
                    {
                        question: "Can we play our own music or bring a DJ?",
                        answer: "Yes to both. We have a sound system you can connect your phone or laptop to for a playlist. If you would prefer a DJ, we have space and power connections available. Just let us know when you book."
                    },
                    {
                        question: "Is there a room hire fee for wedding receptions?",
                        answer: "For wedding receptions that include a catering package, there is generally no separate room hire fee — just a minimum spend on food and drink. Contact us for specific details based on your guest numbers and requirements."
                    },
                    {
                        question: "Can we decorate the venue?",
                        answer: "Yes, you are welcome to bring your own decorations — balloons, flowers, table centres, photo walls, and banners are all fine. We ask that you avoid loose confetti and glitter. You can arrive early on the day to set up."
                    },
                    {
                        question: "Do you cater for dietary requirements?",
                        answer: "Yes. We can cater for vegetarian, vegan, gluten-free, and other dietary needs. Please let us know the requirements when you book and we will ensure all your guests are catered for."
                    }
                ]}
            />
        </>
    )
}
