import { Card, CardBody, Container, SectionHeading } from '@/components/ui'
import { PRIVATE_HIRE_DEPOSIT_WORDING } from '@/lib/approved-wording'

// The practical guide that used to live at /blog/wake-venue-near-heathrow,
// moved here on the owner's approval (30 October 2026) because the post
// outranked this page on "near me" searches. That address redirects here.

const VENUE_TYPES = [
  {
    title: 'A Pub With a Private Room',
    body: 'Warm and relaxed. Food is usually a buffet, parking is often free, and timings can often be adapted. Staff at a pub that hosts wakes will know the tone to set.',
  },
  {
    title: 'A Hotel Function Room',
    body: 'More formal, usually with a fixed menu and a set timetable, and parking is often paid. It can suit you if people need somewhere to stay. Ask what room hire, food and parking come to before you decide.',
  },
  {
    title: 'A Community Hall',
    body: "The most control and usually the lowest cost, but the most work. You'll normally sort the food and drinks yourself, set up the room and clean up afterwards.",
  },
  {
    title: 'A Restaurant Private Dining Room',
    body: 'Intimate, usually with a fixed menu. It suits a smaller group who want to sit down together. Parking varies.',
  },
]

const WHAT_TO_LOOK_FOR = [
  ['A private or semi-private area.', 'The gathering feels like yours, not mixed in with everyone else.'],
  ['Flexible timing.', 'Some wakes run two hours, others drift into the evening. Ask what times each place can offer.'],
  ['Simple food.', 'Finger buffets and sandwiches are the most common choice. Elaborate menus are rarely what people want on the day.'],
  ['Free parking.', 'Nobody coming from a funeral should have to worry about pay-and-display machines or parking apps.'],
  ['Step-free access.', "Many people at a wake are older, so ask how they'll get in and around, and what the toilets are like."],
  ['Staff who understand.', "People who've hosted wakes before know when to be there and when to step back."],
  ['Clear food minimums.', "Numbers at a wake are hard to predict. Some people say they'll come and can't, and others turn up unannounced. Ask what minimum numbers apply to the food."],
  ['Space for funeral cars.', 'If the cortege is coming straight from the service, the hearse or cars need somewhere to pull in safely.'],
]

const HOW_IT_COMES_TOGETHER = [
  ['In the first few days', "Most families contact a funeral director, who'll help arrange the service. The wake afterwards is usually down to the family. Some funeral directors can recommend somewhere, but it's worth knowing your options."],
  ['One to two weeks before', "This is when most wakes are booked. They're rarely planned months ahead, and a pub that hosts wakes will understand that."],
  ['In the days before', "You'll confirm rough numbers (they're never exact), choose the food, and decide if you'd like photos, flowers or music."],
  ['On the day', 'People usually arrive straight from the service. A wake often lasts two to four hours, though some go on longer.'],
]

const FOOD_OPTIONS = [
  ['Sandwich or finger buffet.', "By far the most popular. It's easy for people to help themselves, and practical when numbers are uncertain."],
  ['Hot buffet.', 'A step up from finger food, and good for a larger gathering where people may not have eaten much during the day.'],
  ['Afternoon tea.', 'A popular choice, especially with older relatives. It feels a little more special without being formal.'],
]

const SHORT_NOTICE_STEPS = [
  ['Call rather than email.', "When time's tight, a call is the quickest way to find out if your date is free."],
  ['Give a rough number.', 'Nobody expects precision. "Somewhere between 30 and 50" is perfectly fine.'],
  ['Ask for a simple menu.', 'The simpler the food, the easier it is to arrange at short notice.'],
  ['Agree a point of contact.', "Let us know who to call with questions, and make sure they can take calls while you're planning."],
  ['Ask about the deposit.', PRIVATE_HIRE_DEPOSIT_WORDING],
]

const SMALL_THINGS = [
  ["Tell the funeral director where you're going.", 'They can pass the address on, and sometimes coordinate arrival times.'],
  ['Think about a photo display.', 'A few framed photos near the door give people something to gather around when they first arrive.'],
  ['Think about children.', "If children are coming, check if there's outdoor space or a quieter corner for them."],
  ['Keep it simple.', 'Tea, sandwiches and a warm room is enough. Nobody judges the catering at a wake.'],
  ['Ask about end times.', "Some places expect you to finish by a set time, so it's worth asking before the day."],
]

function BoldLeadList({ items }: { items: string[][] }): React.JSX.Element {
  return (
    <ul className="mx-auto space-y-3 text-ink-muted">
      {items.map(([lead, body]) => (
        <li key={lead}>
          <strong className="text-ink-strong">{lead}</strong> {body}
        </li>
      ))}
    </ul>
  )
}

export function WakePlanningGuide(): React.JSX.Element {
  return (
    <>
      <section className="py-section-y bg-surface">
        <Container>
          <SectionHeading
            title="Where to Hold a Wake Near Staines and Heathrow"
            lead="There's no single right answer. It depends on your numbers, your budget and what feels right for the person you're remembering."
          />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {VENUE_TYPES.map((venue) => (
              <Card key={venue.title} className="h-full">
                <CardBody className="flex h-full flex-col gap-2">
                  <h3 className="font-display text-h4 text-ink-strong">{venue.title}</h3>
                  <p className="text-ink-muted">{venue.body}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-surface-sunk">
        <Container>
          <SectionHeading title="What to Look for in a Wake Venue" />
          <BoldLeadList items={WHAT_TO_LOOK_FOR} />
        </Container>
      </section>

      <section className="py-section-y bg-surface">
        <Container>
          <SectionHeading title="How a Wake Usually Comes Together" />
          <div className="mx-auto space-y-4 text-ink-muted">
            <BoldLeadList items={HOW_IT_COMES_TOGETHER} />
            <p>
              The best advice we can give is to ask one person to be the point of contact. It doesn&apos;t need to be the closest relative. A friend, a neighbour or a colleague can look after the details, so the family can just turn up and be looked after.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-surface-sunk">
        <Container>
          <SectionHeading
            title="What Food Works at a Wake"
            lead="It doesn't need to be elaborate. Most families choose one of these."
          />
          <div className="mx-auto space-y-4 text-ink-muted">
            <BoldLeadList items={FOOD_OPTIONS} />
            <p>
              Here, sandwich, finger and hot buffets start from 30 guests, and afternoon tea from 20. The packages above show the current prices.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-surface">
        <Container>
          <SectionHeading title="Booking a Wake at Short Notice" />
          <ol className="mx-auto list-decimal space-y-3 pl-6 text-ink-muted">
            {SHORT_NOTICE_STEPS.map(([lead, body]) => (
              <li key={lead}>
                <strong className="text-ink-strong">{lead}</strong> {body}
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="py-section-y bg-surface-sunk">
        <Container>
          <SectionHeading title="Small Things That Help on the Day" />
          <BoldLeadList items={SMALL_THINGS} />
        </Container>
      </section>
    </>
  )
}
