# Photography Brief — The Anchor Pub Website

**Prepared:** May 2026  
**For:** Photographer / photo asset pipeline  
**Website:** https://www.the-anchor.pub  
**Location:** The Anchor, Horton Road, Stanwell Moor, near Heathrow Airport

---

## How to use this brief

Each entry shows:
- **Save to** — exact file path relative to `public/` where the image must be placed for the website to use it
- **Subject** — what the photo should show
- **Dimensions** — target aspect ratio / crop (all hero images render at 1200 × 630 for OG; on-page heroes fill a 16:9 or 21:9 strip)
- **Priority** — High (hero / above fold), Medium (body section), Low (secondary / OG only)

Images already confirmed present and in good shape are listed at the end as **Reference examples**.

---

## Priority 1 — Hero images missing entirely (page-specific folders do not exist)

### 1. Function Room Hire

**Page:** `/function-room-hire`  
**Save to:** `public/images/page-headers/function-room-hire/function-room-hire.jpg`  
**Priority:** HIGH — hero banner, OG image  
**Current state:** Falls back to generic `corporate-events.jpg`

**Subject:**  
The main function room (conservatory or dining room) laid out for a private event. Round or rectangular tables dressed with glassware and centrepieces, ideally showing 4–6 round tables that would seat 30–40 guests. Room should look bright, welcoming, not corporate-sterile. Natural light from windows if possible. No visible guests required — empty room or venue team tidying is fine. Aim to convey "pub warmth + private occasion capacity."

- Aspect ratio: 16:9 landscape, minimum 1400 × 788 px
- Alternative crop needed: 1:1 square (used in some card layouts) — shoot wide enough to allow both

---

### 2. Karaoke Night

**Page:** `/karaoke`  
**Save to:** `public/images/page-headers/karaoke/karaoke.jpg`  
**Priority:** HIGH — hero banner, OG image  
**Current state:** Falls back to generic `whats-on.jpg` event image

**Subject:**  
Karaoke night atmosphere inside the pub. Options in order of preference:
1. A small group (2–4 people) laughing and singing together with a microphone in frame, warm pub lighting
2. Close-up of a microphone on a stand with stage lighting / coloured wash in background and blurred pub crowd
3. Wide shot of the pub interior set up for karaoke — small stage/screen area, audience tables in foreground

No copyrighted song lyrics should be visible on any screen in the frame.

- Aspect ratio: 16:9 landscape, minimum 1400 × 788 px

---

### 3. Live Sport (general)

**Page:** `/live-sport` (parent page)  
**Save to:** `public/images/page-headers/live-sport/live-sport.jpg`  
**Priority:** HIGH — hero banner, OG image  
**Current state:** Falls back to generic homepage image

**Subject:**  
Pub atmosphere during a live sport broadcast. Guests watching a large screen, pints on the table, engaged expressions. Terrestrial sport on screen (football, rugby preferred). The screen does not need to be sharp — motion blur is fine. Warm pub lighting. Do not show Sky/TNT/BT Sport logos.

- Aspect ratio: 16:9 landscape, minimum 1400 × 788 px
- Note: The Six Nations page already has `six-nations/hero-pub.jpg` — this is a good reference for tone

---

### 4. Events / What's On (general)

**Page:** `/whats-on`  
**Save to:** `public/images/page-headers/whats-on/whats-on.jpg`  
**Priority:** HIGH — this is the DEFAULT_EVENT_IMAGE fallback used by: `/cash-bingo`, `/quiz-night`, `/karaoke`, and any future event pages  
**Current state:** File exists but content unknown — treat as needing replacement if it is a generic/old shot

**Subject:**  
Lively pub evening — tables of guests, drinks visible, warm lighting. Could be a quiz night setup (question sheets on tables, pencils), or a general busy evening. Conveys "something is on tonight." Do not make it Christmas or sport-specific as it serves as the year-round event fallback.

- Aspect ratio: 16:9, minimum 1400 × 788 px

---

### 5. Book a Table

**Page:** `/book-table`  
**Save to:** `public/images/page-headers/book-table/book-table.jpg`  
**Priority:** MEDIUM — hero banner  
**Current state:** Falls back to homepage image

**Subject:**  
Welcoming table setting in the dining room or conservatory. A dressed table for 2–4 (cutlery, wine glasses, maybe a small menu), warm natural or soft interior light. Conveys "you're expected and welcome." No guests needed.

- Aspect ratio: 16:9, minimum 1400 × 788 px

---

## Priority 2 — Hero images using a generic fallback (folder exists, image is wrong type)

### 6. Function Room Hire — sub-pages using DEFAULT_CORPORATE_IMAGE

The following four private hire sub-pages all show the generic `corporate-events.jpg` as their hero. Each needs its own emotionally appropriate image.

#### 6a. Milestone Birthdays

**Page:** `/private-hire/milestone-birthdays`  
**Save to:** `public/images/page-headers/private-hire/milestone-birthdays.jpg`  
**Priority:** HIGH  
**Subject:** Birthday party setup in the function room — decorated table, balloons (gold/white or neutral), birthday cake area. No age-specific decor so image works for 30th, 40th, 50th, 60th, 70th. Warm, celebratory mood.

#### 6b. Retirement Parties

**Page:** `/private-hire/retirement-parties`  
**Save to:** `public/images/page-headers/private-hire/retirement-parties.jpg`  
**Priority:** HIGH  
**Subject:** Warm group gathering in the function room. Round tables, guests (can be staff) raising glasses. Relaxed, celebratory. Avoid overly aged or corporate styling.

#### 6c. Wakes / Celebration of Life

**Page:** `/private-hire/wakes`  
**Save to:** `public/images/page-headers/private-hire/wakes.jpg`  
**Priority:** HIGH  
**Subject:** Subdued but warm interior — the dining room or conservatory in softer lighting, tables with simple flowers or candles, no bright balloons. Conveys quiet dignity and comfort. Guests optional; if present, they should look calm and supported rather than celebratory.

#### 6d. Engagement Parties

**Page:** `/private-hire/engagement-parties`  
**Save to:** `public/images/page-headers/private-hire/engagement-parties.jpg`  
**Priority:** HIGH  
**Subject:** Romantic party setup — close-up of champagne flutes being clinked, or a dressed table with flowers, or a couple (or hands with ring) in a warm pub setting. Avoid generic stock-photo feel.

#### 6e. Gender Reveal

**Page:** `/private-hire/gender-reveal`  
**Save to:** `public/images/page-headers/private-hire/gender-reveal.jpg`  
**Priority:** MEDIUM  
**Subject:** Party balloon arrangement in the function room — could be a mix of white/gold balloons, a decorated table, or a colourful confetti-pop moment (no gender colour required — keep neutral). Joyful, family-friendly feel.

---

### 7. Location / SEO pages using homepage fallback

The following pages all share the generic homepage image as their OG/Twitter social card. They would benefit from a dedicated "exterior + Heathrow context" shot for better click-through on social sharing. One photo can serve all of them.

**Pages:**  
`/feltham-pub`, `/pub-near-novotel-heathrow`, `/pub-near-sofitel-heathrow`, `/pub-garden-heathrow`, `/heathrow-family-dining`, `/live-sport/six-nations`, `/live-sport/f1`, `/live-sport/world-cup`, `/bank-holiday-weekends`, `/bonfire-night`

**Save to:** `public/images/page-headers/near-heathrow/heathrow-airport-view.jpg`  
**Priority:** MEDIUM  
**Note:** A file at this path already exists (`DEFAULT_NEAR_HEATHROW_IMAGE` points here) — check quality; if it clearly shows The Anchor exterior with aircraft or Heathrow proximity context it may already be sufficient.

**Subject (if replacement needed):**  
Exterior of The Anchor with an aircraft visible in the background or sky. Late afternoon or golden hour. Pub sign in frame. Conveys "pub near Heathrow" immediately.

- Aspect ratio: 16:9, minimum 1400 × 788 px

---

## Priority 3 — Body section images (inline, not hero)

### 8. Private Hire event-type cards (body section gallery)

The `/private-hire` main page has a 5-card gallery section with one image per event type. All 5 images exist in `public/images/private-hire/` but were likely placeholder-supplied. Review each for quality:

| Card | File | What it should show |
|------|------|---------------------|
| Wakes | `private-hire/wakes.jpg` | See 6c above |
| Christenings | `private-hire/christenings.jpg` | Baby with family, soft warm tones, or decorated table with christening cake. No religious iconography required. |
| Parties | `private-hire/parties.jpg` | Lively table of adults with drinks, party atmosphere, function room setting |
| Baby Showers | `private-hire/baby-showers.jpg` | Pastel-decorated table, gift bags, balloons — gender-neutral palette preferred |
| Corporate | `private-hire/corporate.jpg` | Round table set for a meeting or corporate lunch — neat, professional but pub-warm |

- Aspect ratio: 4:3 landscape (card displays at ~400 × 300 px on desktop)
- These render at 33vw on desktop, 100vw mobile

### 9. Venue layout photos (body section, `/private-hire`)

The `/private-hire` page shows two room photos side-by-side. Both files exist — review quality:

| Use | File | Should show |
|-----|------|-------------|
| Conservatory | `dining-room/conservatory.jpg` | The glass conservatory extension — light, airy, ideally with natural daylight through glass roof/walls |
| Dining room | `dining-room/dining-room.jpg` | The main dining room interior — warm lighting, tables set, wooden pub character visible |

- Aspect ratio: 16:9 or 3:2 landscape

### 10. Join Our Team — image strip

The `/join-our-team` page has a 3-image horizontal strip. Currently uses:
1. `our-pub/the-anchor-bar.jpg` — exists
2. `join-our-team/guinness-handover.jpg` — exists (Guinness being handed across the bar)
3. `food/sunday-roast/the-anchor-sunday-roast-hero.jpg` — exists

The strip is intended to show working life at The Anchor. The images exist but were chosen programmatically. Consider adding:

**Save to:** `public/images/join-our-team/team-behind-bar.jpg`  
**Priority:** LOW  
**Subject:** 1–2 staff members behind the bar, smiling, mid-service. Natural pub lighting. Conveys team culture and what working there looks like.

- Aspect ratio: 4:3, renders at 33vw desktop

---

## Pages already well-served (reference examples)

These pages have dedicated, purpose-built photos — use as quality/tone benchmarks:

| Page | Image | Notes |
|------|-------|-------|
| `/christmas-parties` | `page-headers/christmas-parties/2026/hero-table.jpg` | Decorated table, festive styling — gold standard for event page heroes |
| `/sunday-lunch` | `food/sunday-roast/the-anchor-sunday-roast-hero.jpg` | Food hero — well-lit, appetite-appealing |
| `/beer-garden` | `page-headers/beer-garden/beer-garden.jpg` | Exterior space photo |
| `/live-sport/six-nations` | `six-nations/hero-pub.jpg` | Pub interior during live sport — use as tone ref for item 3 above |
| `/our-pub` | Multiple `our-pub/*.jpg` images | Interior photos — good pub character reference |

---

## Technical delivery requirements

- **Format:** JPEG, quality 85–90, progressive encoding
- **Minimum dimensions:** 1400 × 788 px for heroes; 800 × 600 px for body cards
- **OG image crop:** All heroes must support a centred 1200 × 630 crop without losing the key subject
- **File size:** Target under 300 KB per hero after compression (use Squoosh or ImageOptim)
- **Filename convention:** lowercase, hyphen-separated, descriptive (as specified in each "Save to" path above)
- **No watermarks, no visible brand other than The Anchor**
- **People:** If guests appear, obtain photo release. Staff are fine without release for commercial use on the pub's own website.
