import Link from 'next/link'
import { Button, SectionHeader } from '@/components/ui'
import { Metadata } from 'next'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { EventSchema } from '@/components/seo/EventSchema'
import { staticEvents } from '@/lib/static-events'
import { PhoneButton } from '@/components/PhoneButton'
import { BookTableButton } from '@/components/BookTableButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { dragShowEventSeries } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Drag Shows | The Anchor - Heathrow Pub & Dining | Monthly Entertainment',
  description: 'Spectacular monthly drag shows at The Anchor with Nikki Manfadge. Inclusive, fun entertainment near Heathrow. Book your table for an unforgettable night!',
  keywords: 'drag shows stanwell moor, drag queen near heathrow, nikki manfadge, saturday night entertainment surrey',
  openGraph: {
    title: 'Monthly Drag Shows at The Anchor',
    description: 'Join us for spectacular drag performances with Nikki Manfadge - check our What\'s On page for dates!',
    images: ['/images/events/drag-shows/the-anchor-drag-show-nikki-manfadge-stanwell-moor.jpg'],
  },
  twitter: getTwitterMetadata({
    title: 'Monthly Drag Shows at The Anchor',
    description: 'Join us for spectacular drag performances with Nikki Manfadge - check our What\'s On page for dates!',
    images: ['/images/events/drag-shows/the-anchor-drag-show-nikki-manfadge-stanwell-moor.jpg']
  })
}

export default function DragShowsPage() {
  return (
    <>
      
      {/* Hero Section */}
      <HeroWrapper
        route="/whats-on/drag-shows"
        title={
          <>
            Nikki Manfadge Presents:<br/>
            <span className="text-3xl md:text-5xl lg:text-6xl">Drag Royalty at The Anchor</span>
          </>
        }
        description="Where Stanwell Moor meets Vegas, darling!"
        variant="promo"
        tags={[
          { label: '👑 7PM Start', variant: 'default' },
          { label: '🎭 Live Performance', variant: 'default' },
          { label: '🏳️‍🌈 Everyone Welcome', variant: 'default' },
          { label: '🍹 Themed Cocktails', variant: 'default' }
        ]}
        primaryCta={
          <BookTableButton
            source="drag_shows_hero"
            variant="primary"
            size="lg"
            context="drag_show"
            className="w-full sm:w-auto"
          >
            👑 Book Your Table
          </BookTableButton>
        }
        secondaryCta={
          <PhoneButton
            phone="01753 682707"
            source="drag_shows_hero"
            variant="secondary"
            size="lg"
            className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm w-full sm:w-auto"
          >
            📞 Call: 01753 682707
          </PhoneButton>
        }
      />

      {/* Page Title */}
      <section className="bg-white py-8">
        <div className="container mx-auto px-4">
          <PageTitle className="text-center text-anchor-green" seo={{ structured: true, speakable: true }}>
            Drag Shows - Saturday Night Entertainment
          </PageTitle>
        </div>
      </section>

      {/* Pre-Show Dining & Drinks */}
      <section className="section-spacing bg-anchor-cream/50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <SectionHeader
              title="Make a Night of It"
              subtitle="Book your table, grab stone-baked pizzas or Sunday roast before the show."
            />
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-semibold text-anchor-green mb-2">Sunday Roast Pre-Show</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Matinee seating from 12pm-5pm every Sunday drag brunch. Book by 1pm Saturday to guarantee roasts for the whole table.
                </p>
                <div className="flex flex-col gap-2">
                  <BookTableButton
                    source="drag_show_roast_cta"
                    variant="primary"
                    size="sm"
                    className="w-full"
                  >
                    Book Sunday Roast
                  </BookTableButton>
                  <Link href="/sunday-lunch" className="text-sm text-anchor-gold font-semibold hover:text-anchor-green transition">
                    Sunday roast menu →
                  </Link>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-semibold text-anchor-green mb-2">Stone-Baked Pizza Afterparty</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Hand-stretched pizzas with bold toppings — perfect for drag troupe rehearsals, crew socials and girls’ nights out.
                </p>
                <div className="flex flex-col gap-2">
                  <BookTableButton
                    source="drag_show_pizza_cta"
                    context="pizza_menu"
                    variant="primary"
                    size="sm"
                    className="w-full"
                  >
                    Book a Table
                  </BookTableButton>
                  <Link href="/food-menu#pizza" className="text-sm text-anchor-gold font-semibold hover:text-anchor-green transition">
                    View pizza menu →
                  </Link>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-semibold text-anchor-green mb-2">Cocktails & All-Day Menu</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Sip themed cocktails, prosecco towers, and nibble on sharers before the show. Full food menu served until late.
                </p>
                <div className="flex flex-col gap-2">
                  <BookTableButton
                    source="drag_show_food_menu_cta"
                    variant="primary"
                    size="sm"
                    className="w-full"
                  >
                    Book a Table
                  </BookTableButton>
                  <Link href="/food-menu" className="text-sm text-anchor-gold font-semibold hover:text-anchor-green transition">
                    Browse food & drinks →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Our Drag Shows */}
      <section className="section-spacing bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-anchor-green mb-8 text-center">
              A Saturday Night Like No Other
            </h2>
            
            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="text-xl mb-6 text-center">
                Join us monthly as The Anchor transforms into Stanwell Moor's premier 
                entertainment venue with our spectacular drag shows!
              </p>
              
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-pink-50 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-anchor-green mb-4">The Show</h3>
                  <ul className="space-y-3">
                    <li className="flex gap-3">
                      <span className="text-pink-500">✨</span>
                      <span>Dazzling costume changes</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-pink-500">🎤</span>
                      <span>Lip-sync performances to your favourite hits</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-pink-500">😂</span>
                      <span>Hilarious comedy and audience interaction</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-pink-500">🎉</span>
                      <span>Birthday shout-outs and celebrations</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-purple-50 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-anchor-green mb-4">The Experience</h3>
                  <ul className="space-y-3">
                    <li className="flex gap-3">
                      <span className="text-purple-500">🏳️‍🌈</span>
                      <span>Inclusive, welcoming atmosphere</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-purple-500">🍹</span>
                      <span>Themed cocktails and drink specials</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-purple-500">📸</span>
                      <span>Photo opportunities with the queens</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-purple-500">🎊</span>
                      <span>Perfect for hen dos and celebrations</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Queens */}
      <section className="section-spacing bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-anchor-green mb-12 text-center">
              Meet Your Hostess with the Mostess
            </h2>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
              <h3 className="text-2xl font-bold text-purple-700 mb-6">The Legendary Nikki Manfadge</h3>
              
              <div className="prose prose-lg max-w-none text-gray-700">
                <p className="text-lg mb-4 italic">
                  "Alright darlings, gather round while I tell you a story that'll make your mascara run..."
                </p>
                
                <p className="mb-4">
                  Born on a Russian fishing trawler in the Baltic Sea (don't ask, love - Mother had a thing 
                  for adventure and cheap vodka), I entered this world wrapped in nothing but a silk scarf 
                  and determination. The fishermen took one look at me and said "She's got the spirit of a 
                  diva!" - and they weren't wrong, were they?
                </p>
                
                <p className="mb-4">
                  From dodging bus fares in Sheffield shopping centres to nearly marrying a Saudi prince 
                  (turned out he worked at Greggs in Rotherham - the tiara should've been a giveaway), 
                  my journey to The Anchor has been nothing short of spectacular, darling. I've had more 
                  ups and downs than a bride's nightie, but here I am, still standing in 8-inch heels!
                </p>
                
                <h4 className="text-xl font-bold text-purple-700 mb-3">The Manfadge Method</h4>
                <p className="mb-4">
                  Every Saturday night, I transform The Anchor into my personal palace of fabulousness. 
                  We're talking costume changes that'd make Madonna jealous, lip-syncs so fierce they'll 
                  snatch your wig, and comedy that'll have you clutching your pearls - if you can afford 
                  pearls in this economy, love.
                </p>
                
                <div className="bg-pink-50 rounded-xl p-6 mb-6">
                  <p className="text-lg font-semibold text-purple-700 mb-2">A Word from Nikki:</p>
                  <p className="italic">
                    "Listen, I've performed everywhere from Baltic trawlers to bingo halls, but The Anchor? 
                    This is home, darlings. Where else can you get a proper pint, a decent meal, and a 
                    show that'll leave you gagging? Plus, the manager lets me keep my wigs in the store 
                    cupboard - that's true love, that is!"
                  </p>
                </div>
                
                <h4 className="text-xl font-bold text-purple-700 mb-3">What to Expect from Queen Nikki</h4>
                <ul className="space-y-2 mb-6">
                  <li className="flex gap-3">
                    <span className="text-pink-500">💄</span>
                    <span>More sequins than a disco ball factory explosion</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-pink-500">🎭</span>
                    <span>Stories that'll make you laugh, cry, and question your life choices</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-pink-500">👠</span>
                    <span>Heels higher than my credit card debt (and that's saying something)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-pink-500">🎤</span>
                    <span>Performances that'll have you living, dying, and resurrecting</span>
                  </li>
                </ul>
                
                <p className="text-lg font-semibold">
                  Remember darlings: Life's a drag, so you might as well make it fabulous! 
                  See you Saturday night - and don't forget to tip your queen! 💋
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-purple-700 mb-4">Special Guest Queens</h3>
              <p className="text-gray-700 text-lg mb-4">
                Throughout the year, I invite some of my most talented sisters to grace our stage. 
                We're talking proper queens, love - not like that time my sister Gwyneth tried to 
                borrow my wig. (She looked like a startled pigeon caught in a car wash, bless her.)
              </p>
              <p className="text-gray-700 italic">
                "I only work with the best, darlings. If they can't death-drop in 8-inch platforms 
                while holding a gin and tonic, they're not ready for The Anchor!" - Nikki
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Manfadge Dynasty */}
      <section className="section-spacing bg-gradient-to-br from-purple-50 via-pink-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-anchor-green mb-12 text-center">
              The Manfadge Family Circus
            </h2>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <p className="text-lg mb-6 italic text-purple-700">
                "You think your family's dysfunctional? Let me tell you about mine, love..."
              </p>
              
              <div className="space-y-6">
                <div className="border-l-4 border-pink-500 pl-6">
                  <h4 className="text-xl font-bold text-purple-700 mb-2">Sister Gwyneth "The Grump"</h4>
                  <p className="text-gray-700">
                    "My older sister Gwyneth - or as I call her, 'The Face That Launched A Thousand Ships... 
                    In The Opposite Direction.' She's convinced I stole all the glamour genes in the womb. 
                    Now she lives with me, chain-smoking and complaining about everything from my sequins 
                    ('too sparkly before noon') to the thermostat ('it's like the bloody Arctic!'). Love 
                    her though - someone's got to keep my ego in check."
                  </p>
                </div>
                
                <div className="border-l-4 border-purple-500 pl-6">
                  <h4 className="text-xl font-bold text-purple-700 mb-2">Son Terry "The Eternal Teenager"</h4>
                  <p className="text-gray-700">
                    "My 27-year-old son Terry - still lives at home, still 'working on his music.' His 
                    biggest hit was playing pre-made Spotify playlists at a phone repair shop. Keeps 
                    telling me 'rent is theft, Mum' while eating all my food. I love him, but if he 
                    asks to borrow another tenner for his 'big project,' I'm changing the locks."
                  </p>
                </div>
                
                <div className="border-l-4 border-pink-500 pl-6">
                  <h4 className="text-xl font-bold text-purple-700 mb-2">Daughter Shanice "The Sensible One"</h4>
                  <p className="text-gray-700">
                    "Then there's my Shanice - mortgage adviser, Zara blazer enthusiast, and the only 
                    Manfadge with a proper job. She won't let me meet her boyfriend yet. Can't imagine 
                    why - I'd only do a light background check and maybe one small performance at dinner. 
                    She says I'm 'a lot.' I prefer 'generous with my presence.'"
                  </p>
                </div>
                
                <div className="border-l-4 border-purple-500 pl-6">
                  <h4 className="text-xl font-bold text-purple-700 mb-2">Uncle Clive "We Don't Talk About Spain"</h4>
                  <p className="text-gray-700">
                    "And we can't forget Uncle Clive - shows up to family dinners with a new gold chain 
                    and a mysterious suitcase. No one knows what he does for a living, but it involves 
                    frequent trips to Marbella and the phrase 'We don't talk about Spain.' He's either 
                    a criminal mastermind or sells timeshares. Honestly, could go either way."
                  </p>
                </div>
              </div>
              
              <div className="bg-pink-50 rounded-xl p-6 mt-6">
                <p className="text-lg font-semibold text-purple-700 mb-2">Why I'm Telling You This:</p>
                <p className="text-gray-700 italic">
                  "Because darling, if I can survive family dinners with this lot, I can survive anything 
                  you throw at me on stage. Hecklers? Please. Try Christmas dinner with Gwyneth after 
                  she's had her third sherry. Now THAT'S entertainment!"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Event Details */}
      <section className="section-spacing bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-anchor-green mb-12 text-center">
              Plan Your Night Out
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-anchor-cream rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-anchor-green mb-6">Show Times</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-300">
                    <span className="font-semibold">Doors Open</span>
                    <span>7:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-300">
                    <span className="font-semibold">Pre-Show Dining</span>
                    <span>Until 7:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-300">
                    <span className="font-semibold">Show Starts</span>
                    <span>7:00 PM Sharp!</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Show Ends</span>
                    <span>Around 11:30 PM</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-anchor-cream rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-anchor-green mb-6">Booking Info</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex gap-3">
                    <span className="text-anchor-gold">📞</span>
                    <span>Book by phone: 01753 682707</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-anchor-gold">🎟️</span>
                    <span>No ticket needed - just book a table</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-anchor-gold">👥</span>
                    <span>Tables for 2-10 people available</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-anchor-gold">⚠️</span>
                    <span>Book early - Saturday nights fill up fast!</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Perfect For */}
            <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-anchor-green mb-6 text-center">Perfect For...</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-4xl mb-2">💍</div>
                  <p className="font-semibold">Hen Parties</p>
                </div>
                <div>
                  <div className="text-4xl mb-2">🎂</div>
                  <p className="font-semibold">Birthdays</p>
                </div>
                <div>
                  <div className="text-4xl mb-2">👯‍♀️</div>
                  <p className="font-semibold">Girls' Night</p>
                </div>
                <div>
                  <div className="text-4xl mb-2">🎉</div>
                  <p className="font-semibold">Celebrations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nikki's Signature Shows */}
      <section className="section-spacing bg-purple-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-anchor-green mb-12 text-center">
              The Nikki Manfadge Experience
            </h2>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
              <h3 className="text-2xl font-bold text-purple-700 mb-6">Nikki's Games Night</h3>
              <p className="text-lg text-gray-700 mb-4 italic">
                "Right then, you lot! Welcome to my Nikki's Games Night - where the prizes are dubious, 
                the games are ridiculous, and the laughs are guaranteed!"
              </p>
              <p className="text-gray-700 mb-4">
                Every month, Nikki transforms The Anchor into her own twisted game show universe. Think 
                Bruce Forsyth meets Divine, with a dash of Jeremy Kyle for good measure. Audience members 
                become contestants in games that range from "Guess What's in Gwyneth's Handbag" (spoiler: 
                it's usually disappointing) to "Lip Sync for Your Gin" - where dignity goes to die and 
                legends are born.
              </p>
              <div className="bg-pink-50 rounded-xl p-6">
                <p className="font-semibold text-purple-700 mb-2">Past Game Highlights:</p>
                <ul className="space-y-2 text-gray-700">
                  <li>• "Pin the Wig on the Drag Queen" (harder than it sounds after three gins)</li>
                  <li>• "Family Feud: Manfadge Edition" (we surveyed 100 people who've met my sister...)</li>
                  <li>• "The Price is Wrong" (guess the cost of my latest wig - hint: more than your mortgage)</li>
                  <li>• "Wheel of Misfortune" (spin to win... or lose spectacularly)</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-purple-700 mb-6">Nikki's Karaoke Chaos</h3>
              <p className="text-lg text-gray-700 mb-4 italic">
                "Can you sing? No? Perfect! Get up here, love!"
              </p>
              <p className="text-gray-700">
                Once a quarter, we unleash karaoke madness upon Stanwell Moor. But this isn't your 
                average karaoke night - oh no, darling. This is karaoke with a Manfadge twist. I'll 
                be your hostess, your hype woman, and occasionally your backup dancer (those hip 
                replacements were worth every penny). Whether you're murdering Whitney or butchering 
                Beyoncé, I'll make you feel like a star - even if you sound like a strangled cat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="section-spacing bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-anchor-green mb-12 text-center">
              Virgin to the Venue? Nikki's Guide for First-Timers
            </h2>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <p className="text-lg mb-6 italic text-purple-700">
                "Listen up, fresh meat! Here's everything you need to know about surviving your 
                first night at one of my shows..."
              </p>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-purple-700 mb-2">The Atmosphere</h3>
                  <p className="text-gray-700">
                    "Think of it as your auntie's wedding reception, but with better outfits and 
                    less family drama. We're all about love, laughter, and the occasional flying 
                    wig. Leave your judgment at the door - along with your dignity, you won't be 
                    needing either tonight!"
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-purple-700 mb-2">Audience Participation</h3>
                  <p className="text-gray-700">
                    "I might drag you on stage, love - and by might, I mean definitely will if you're 
                    sat in the front row looking nervous. Don't worry, I'm gentle... like a hurricane. 
                    Just remember: the more you resist, the more fun I have. So embrace it, darling - 
                    you might discover your inner diva!"
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-purple-700 mb-2">What to Wear</h3>
                  <p className="text-gray-700">
                    "Dress code? Please! Come in your trackies or your tiara - I don't discriminate. 
                    Though if you turn up in more sequins than me, we might have words. Pro tip: 
                    waterproof mascara is essential - you'll either cry laughing or cry crying when 
                    I read you for filth. It's all love though, promise!"
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-purple-700 mb-2">The Golden Rules</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>
                      <strong>Rule #1:</strong> "When I death drop, you applaud. When I tongue pop, 
                      you scream. When I split, you throw money. Simple as that, love."
                    </li>
                    <li>
                      <strong>Rule #2:</strong> "No touching the wigs unless invited. They cost more 
                      than your car and I'm still paying them off."
                    </li>
                    <li>
                      <strong>Rule #3:</strong> "Photos are encouraged, but get my good side. 
                      (Spoiler: they're all good sides, darling.)"
                    </li>
                    <li>
                      <strong>Rule #4:</strong> "If you heckle, you better be funnier than me. 
                      Spoiler alert: you're not."
                    </li>
                  </ul>
                </div>
                
                <div className="bg-pink-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-purple-700 mb-2">Nikki's Personal Promise</h3>
                  <p className="text-gray-700 italic">
                    "Look, I've been doing this since before some of you were born (don't do the math). 
                    I promise you'll leave with sore cheeks from laughing, a new profile picture, and 
                    possibly questioning your sexuality. It's all part of the Manfadge magic, darling. 
                    Now get that phone out and book a table before they're all gone - I don't perform 
                    to empty chairs, they don't tip!"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why The Anchor's Drag Shows Are Special */}
      <section className="section-spacing bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-anchor-green mb-8 text-center">
              Surrey's Most Fabulous Saturday Night
            </h2>
            
            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="text-xl text-center mb-8">
                The Anchor has become the go-to destination for drag entertainment in the Stanwell Moor 
                and Heathrow area, attracting guests from across Surrey and West London.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div>
                  <h3 className="text-2xl font-bold text-anchor-green mb-4">A Night Like No Other</h3>
                  <p className="mb-4">
                    Each month, our traditional British pub transforms into a glittering cabaret venue. 
                    The magic begins the moment you walk through our doors - rainbow flags flying proud, 
                    disco lights twinkling, and an atmosphere of pure celebration. Our drag shows have 
                    become legendary in the local area, with people travelling from Staines, Ashford, 
                    Heathrow, and beyond for a night they won't forget.
                  </p>
                  <p>
                    What sets The Anchor apart is the perfect blend of traditional pub warmth and 
                    spectacular entertainment. You can enjoy a proper home-cooked meal before the show, 
                    then stay for the performances without the pretension of city venues.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-anchor-green mb-4">Community & Celebration</h3>
                  <p className="mb-4">
                    Our drag nights are more than just entertainment - they're a celebration of diversity 
                    and inclusion in the heart of Surrey. We've hosted countless hen parties, birthday 
                    celebrations, and even a few wedding receptions. The energy is electric, with audiences 
                    ranging from drag first-timers to devoted fans who wouldn't miss a show.
                  </p>
                  <p>
                    Local LGBTQ+ community members tell us The Anchor feels like home - a safe, 
                    welcoming space where everyone can be themselves. That's exactly the atmosphere 
                    we've worked hard to create.
                  </p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-8 mb-12">
                <h3 className="text-2xl font-bold text-anchor-green mb-4 text-center">
                  What Makes Saturday Special
                </h3>
                <p className="text-gray-700 mb-4">
                  Saturday nights at The Anchor are an institution. The excitement builds throughout 
                  the day - our kitchen prepares special pre-show dinners, the bar stocks up on 
                  prosecco and cocktails, and by 8pm, the venue is buzzing with anticipation. Tables 
                  fill with groups of friends, couples on date nights, and solo guests who've become 
                  part of our extended family.
                </p>
                <p className="text-gray-700">
                  When Nikki Manfadge takes the stage at 7pm sharp, the transformation is complete. 
                  For the next two and a half hours, you're transported to a world of glamour, 
                  laughter, and jaw-dropping performances. It's not just a drag show - it's the 
                  highlight of Stanwell Moor's social calendar.
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-lg text-gray-700">
                  Whether you're a drag enthusiast or curious first-timer, whether you're celebrating 
                  a special occasion or just want a fantastic night out, The Anchor's Saturday drag 
                  shows offer something truly special. In a world of generic entertainment, we're 
                  proud to bring world-class drag performances to our village pub.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nikki's Advice Corner */}
      <section className="section-spacing bg-gradient-to-br from-pink-100 via-purple-100 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-anchor-green mb-12 text-center">
              Nikki's Pearls of Wisdom
            </h2>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <p className="text-lg mb-6 italic text-purple-700">
                "After 25 years in the business, love, I've learned a thing or two about life. 
                Sit down, grab a gin, and let Auntie Nikki enlighten you..."
              </p>
              
              <div className="space-y-6">
                <div className="border-l-4 border-pink-500 pl-6">
                  <h3 className="text-lg font-bold text-purple-700 mb-2">On Fashion:</h3>
                  <p className="text-gray-700 italic">
                    "If you can't see it from the back row, it's not worth wearing. My philosophy? 
                    More is more, and then add a bit more. Life's too short for subtle, darling."
                  </p>
                </div>
                
                <div className="border-l-4 border-purple-500 pl-6">
                  <h3 className="text-lg font-bold text-purple-700 mb-2">On Confidence:</h3>
                  <p className="text-gray-700 italic">
                    "I once performed the entire first act with my wig on backwards. Did I stop? 
                    No! I told the audience it was haute couture. They believed me. That's confidence, love."
                  </p>
                </div>
                
                <div className="border-l-4 border-pink-500 pl-6">
                  <h3 className="text-lg font-bold text-purple-700 mb-2">On Family:</h3>
                  <p className="text-gray-700 italic">
                    "They say you can't choose your family. Well, I say you can choose how much 
                    wine you drink before Sunday dinner with them. That's basically the same thing."
                  </p>
                </div>
                
                <div className="border-l-4 border-purple-500 pl-6">
                  <h3 className="text-lg font-bold text-purple-700 mb-2">On Age:</h3>
                  <p className="text-gray-700 italic">
                    "I'm like a fine wine, darling - getting better with age and likely to give 
                    you a headache if you have too much. But at least I'm memorable!"
                  </p>
                </div>
                
                <div className="border-l-4 border-pink-500 pl-6">
                  <h3 className="text-lg font-bold text-purple-700 mb-2">On Success:</h3>
                  <p className="text-gray-700 italic">
                    "Success is when the bailiffs know you by name but still stay for a cup of tea. 
                    It's all about relationships, love."
                  </p>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-xl p-6 mt-8">
                <p className="text-lg font-semibold text-purple-700 mb-2">The Manfadge Motto:</p>
                <p className="text-gray-700 italic text-center text-xl">
                  "If life gives you lemons, demand to see life's manager. Then make a gin and tonic - 
                  you'll need the vitamin C for all that complaining!"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Behind the Glitter */}
      <section className="section-spacing bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-anchor-green mb-12 text-center">
              Behind the Glitter: The Real Nikki
            </h2>
            
            <div className="prose prose-lg max-w-none text-gray-700">
              <div className="bg-pink-50 rounded-2xl p-8 mb-8">
                <h3 className="text-2xl font-bold text-purple-700 mb-4">The Early Years</h3>
                <p className="mb-4">
                  "Picture it: Sheffield, 1985. A young lad with dreams bigger than his mother's 
                  hair rollers discovers his sister's makeup bag. One badly applied lipstick later, 
                  and Nikki Manfadge was born. Well, after I'd scrubbed the lipstick off the bathroom 
                  mirror and convinced Dad it was modern art."
                </p>
                <p className="mb-4">
                  Started performing at working men's clubs where the only thing harder than the 
                  audience was the pork scratchings. Cut my teeth (nearly literally) dodging beer 
                  bottles and winning over crowds who thought 'culture' was something you found in 
                  yoghurt.
                </p>
              </div>
              
              <div className="bg-purple-50 rounded-2xl p-8 mb-8">
                <h3 className="text-2xl font-bold text-purple-700 mb-4">The Rise to Local Stardom</h3>
                <p className="mb-4">
                  "By the '90s, I was the toast of the Northern circuit. Well, more like the slightly 
                  burnt bit of toast you'd still eat because you can't be bothered making more. Had 
                  my own monthly residency at Rotherham's premier venue (above the chippy on the high 
                  street - glamorous, I know)."
                </p>
                <p className="mb-4">
                  Won 'Miss Congeniality' at the 1997 Barnsley Drag Championships. Mainly because I 
                  was the only one who didn't lamp the judge when they announced the winner. Sometimes 
                  success is just about showing up and not causing a scene, love.
                </p>
              </div>
              
              <div className="bg-pink-50 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-purple-700 mb-4">Finding Home at The Anchor</h3>
                <p className="mb-4">
                  "Ended up in Stanwell Moor by accident - thought I was going to Stanwell. Got off 
                  the bus, saw The Anchor, popped in for a quick gin. That was 2019. Still here. The 
                  manager said I could perform if I helped with the washing up. Joke's on him - these 
                  nails don't do dishes!"
                </p>
                <p className="mb-4">
                  But seriously, The Anchor's become my home. Where else would let me store three 
                  suitcases of wigs in the cellar and practice my death drops in the function room? 
                  This place and these people - they're family now. Dysfunctional, chaotic, slightly 
                  unhinged family. Just how I like it.
                </p>
                <p className="italic text-purple-700">
                  "Every Saturday night, when I see that packed room full of smiling faces, I remember 
                  why I do this. It's not about the fame (clearly), it's not about the money (DEFINITELY 
                  not), it's about bringing a bit of sparkle to Stanwell Moor. And if I can make someone 
                  forget their troubles for a few hours, then these heels are worth every blister!"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-spacing bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready for a Night with Nikki?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto italic">
            "Don't just sit there gawping at your phone, love - book a table! 
            I don't perform to empty chairs, they're terrible tippers!"
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <BookTableButton
              source="drag_shows_cta"
              variant="secondary"
              size="lg"
              context="drag_show"
              className="bg-white text-purple-600 hover:bg-gray-100"
            >
              👑 Book Your Table
            </BookTableButton>
            <Link href="/food-menu#pizza" className="w-full sm:w-auto">
              <Button 
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                🍕 Pizza Menu
              </Button>
            </Link>
            <Link href="/sunday-lunch" className="w-full sm:w-auto">
              <Button 
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                🍖 Sunday Roast Info
              </Button>
            </Link>
            <PhoneButton
              phone="01753 682707"
              source="drag_shows_cta"
              variant="secondary"
              size="lg"
              className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
            >
              📞 Call: 01753 682707
            </PhoneButton>
            <Link href="/whats-on" className="w-full sm:w-auto">
              <Button 
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto bg-white text-anchor-green hover:bg-gray-100"
              >
                View All Events
              </Button>
            </Link>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-md mx-auto">
            <p className="font-semibold mb-2">Monthly Shows - Check What's On for Dates</p>
            <p>Show starts at 7:00 PM Sharp!</p>
            <p className="text-sm mt-2">The Anchor - Heathrow Pub & Dining</p>
            <p className="text-xs mt-4 italic">
              "And remember - if you're not living your life in full colour, 
              you're doing it wrong!" - Nikki x
            </p>
          </div>
        </div>
      </section>

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ 
          __html: JSON.stringify([
            dragShowEventSeries,
            {
              "@context": "https://schema.org",
              "@type": "PerformingGroup",
              "@id": "https://www.the-anchor.pub/#nikki-manfadge",
              "name": "Nikki Manfadge",
              "description": "Professional drag queen and entertainer bringing Vegas-style shows to Stanwell Moor",
              "genre": ["Drag", "Comedy", "Cabaret"],
              "performerIn": {
                "@id": "https://www.the-anchor.pub/#drag-show-series"
              },
              "sameAs": [
                "https://www.instagram.com/nikkimanfadge/"
              ]
            },
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://www.the-anchor.pub"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "What's On",
                  "item": "https://www.the-anchor.pub/whats-on"
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": "Drag Shows",
                  "item": "https://www.the-anchor.pub/whats-on/drag-shows"
                }
              ]
            }
          ])
        }}
      />
    </>
  )
}
