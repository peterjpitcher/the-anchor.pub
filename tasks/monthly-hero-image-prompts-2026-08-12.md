# Monthly hero images: regeneration prompts

Date: 12 August 2026
Source reviewed: `iCloud/Downloads/The Anchor <Month>.png`, all twelve, at 1672x941.

Signage was read from 2x crops of the A-board, the main chalkboard and the
right-hand wall board. Findings and prompts below.

---

## Where to save them

**Save straight into the repo**, one PNG per month folder, every file named
`page-headers-homepage.png`:

```
public/images/page-headers/home/monthly/
├── january/page-headers-homepage.png
├── february/page-headers-homepage.png
├── march/page-headers-homepage.png
├── april/page-headers-homepage.png
├── may/page-headers-homepage.png
├── june/page-headers-homepage.png
├── july/page-headers-homepage.png
├── august/page-headers-homepage.png
├── september/page-headers-homepage.png
├── october/page-headers-homepage.png
├── november/page-headers-homepage.png
└── december/page-headers-homepage.png
```

Create the folders as you go. PNG is fine, no need to convert or resize
anything yourself.

**They become these**, which is done for you, not by hand:

```
public/images/page-headers/home/monthly/
├── january/page-headers-homepage.jpg
├── february/page-headers-homepage.jpg
├── march/page-headers-homepage.jpg
├── april/page-headers-homepage.jpg
├── may/page-headers-homepage.jpg
├── june/page-headers-homepage.jpg
├── july/page-headers-homepage.jpg
├── august/page-headers-homepage.jpg
├── september/page-headers-homepage.jpg
├── october/page-headers-homepage.jpg
├── november/page-headers-homepage.jpg
└── december/page-headers-homepage.jpg
```

Every file is called `page-headers-homepage.jpg`; the folder name is what
identifies the month. That matches the existing `seasonal/` convention.

The steps in between, which are automated: convert the PNG to JPEG, confirm
1920x1080, compress to under 250KB, delete the PNG, then add the month to
`AVAILABLE_MONTHLY_HEROES` in `lib/seasonal-utils.ts` **in the same commit as
its image file**. That last part matters: `validateSeasonalImage()` returns
true unconditionally in production, so a month listed without its file would
404 on the live site.

Do not commit the PNGs. They are the working copy and get removed during
conversion; only the JPEGs belong in git.

Months can land one at a time. Any month not yet listed falls back to the old
`seasonal/` asset, so the site stays correct throughout.

The existing `seasonal/` folder stays where it is. It is the fallback, not a
duplicate to be cleaned up.

---

## Rules that apply to every image

These are the things that went wrong across the set. Put them in every prompt.

**Never render these words anywhere in the image**, they are banned by
`docs/SSOT.md` section 14:

- `Cask Ales`, `Real Ale`, `Traditional Ales`, `Fine & Cask Ales`
  (The Anchor serves bottled ales only, no handpumps, and must not be positioned
  as a real-ale pub.)
- `Mulled Wine` (owner-confirmed 5 August 2026, we do not sell it)
- `Live Music` (retired site-wide)
- `Open Fires` (unverified, we cannot claim it)
- `Great Sports`, `Sky Sports`, `TNT` (terrestrial channels only)
- `Welsh Grown` (the pub is in Stanwell Moor, Surrey)

**The pub is The Anchor, Stanwell Moor.** Never Draycote, Chadwell, Wadenshope,
Chasehill or any other place name. If a location appears under the wordmark it
must read `STANWELL MOOR`.

**Safe wall-board wording** (use this exact list, it is all SSOT-confirmed):

```
FRESH FOOD
STONE-BAKED PIZZAS
SUNDAY ROAST
BEER GARDEN
QUIZ NIGHTS
FREE PARKING
```

**Safe A-board wording** (this is the version that rendered cleanly in the May,
June, July and August images, so it is known to work):

```
GREENE KING
Proper Pub
Proper People
Proper Good Times
Eat, Drink, Enjoy
```

**The light must ramp through the year**

The set should read as one year, not twelve separate shots. Brightness climbs
from a dark, lit-window January to full daylight in July, then falls away again.
Nothing should jump: each month sits one step from its neighbours.

| Month | Time of day | Sky | Interior lights | Level |
|---|---|---|---|---|
| January | after dark | black-blue, wet ground | full, blazing | 1, darkest |
| February | early evening | deep blue dusk | full | 2 |
| March | dusk, blue hour | fading blue, light still in the sky | full, less dominant | 3 |
| April | late afternoon into golden hour | soft blue with cloud | just coming on | 5 |
| May | early evening, still broad daylight | warm blue, low sun | barely on | 7 |
| June | afternoon | bright blue, a few clouds | off | 9 |
| July | midday | strongest sun, hard shadows | off | 10, brightest |
| August | afternoon | bright blue, warm | off | 9 |
| September | late afternoon, golden | softening, pale gold | off or just on | 7 |
| October | late afternoon into dusk | overcast, grey and gold | coming on | 5 |
| November | dusk, nearly dark | heavy grey cloud | full | 3 |
| December | after dark | deep blue black | full, plus festive lights | 1, darkest |

This happens to match the site: the dark seasonal skin runs 1 September to
31 March and the light one April to August, so the photography and the surface
brighten together rather than fighting each other.

**Dark does not mean underexposed.** The homepage hero lays a heavy dark green
scrim over the whole photo before any text goes on top. A genuinely murky image
turns to mud behind it. The winter months need strong warm light from the
windows, lit signage and a readable building, sitting against a dark sky. Think
"warm pub on a dark evening", not "dim photograph".

**Composition and output**

- 1920 x 1080, 16:9, photographic, no text outside the signage described
- Keep the pub frontage and the main chalkboard within the **central third** of
  the frame. On a phone the homepage hero shows only the middle 31% of the
  width, so anything at the edges is invisible to about half the audience.
- Every word of visible text must be spelled correctly. No decorative
  pseudo-lettering, no invented words, no partial letters.

---

## Per-image verdict

| Month | Main board | Verdict |
|---|---|---|
| January | correct | **Regenerate.** A-board is gibberish, wrong location |
| February | correct | **Regenerate.** A-board gibberish, "GREENKING", Live Music |
| March | correct | **Regenerate.** "Welsh Grown", "CHASEHILL", "Traditional Ales" |
| April | correct | **Regenerate.** "Fine & Cask Ales", "DRAYCOTE", "Traditional Ales" |
| May | correct | Usable. Only the wall board says Live Music |
| June | correct | Usable. Only the wall board says Live Music |
| July | correct | Usable. Wall board slightly garbled |
| August | correct | Usable. Wall board garbled |
| September | correct | **Fix.** Wall board plainly reads CASK ALES |
| October | correct | **Fix.** Wall board reads Cask Ales and Great Sports |
| November | **"fe Lest We Forget"** | **Regenerate.** Headline defect, plus Cask Ales and Open Fires |
| December | correct | **Regenerate.** Wall board reads MULLED WINE |

Six need regenerating, two need the wall board fixed, four are usable as they
stand if you accept a Live Music line that is small and mostly illegible.

---

## Base prompt

Use this for every month, then append the month block underneath.

```
A photorealistic exterior photograph of The Anchor, a traditional white
rendered English village pub in Stanwell Moor, Surrey. Two storeys, dark tiled
roof, black painted plinth along the base of the walls, sash windows, a black
front door with a lantern above it, black metal railings and a gate to the
left, wooden picnic benches on the paved forecourt in front.

Signage, all spelled exactly as written:
- A large framed chalkboard on the left-hand wall, lit by two small downlights.
- A green Greene King A-frame pavement board reading, on separate lines:
  "GREENE KING", "Proper Pub", "Proper People", "Proper Good Times",
  "Eat, Drink, Enjoy".
- A green wall-mounted board on the right reading, on separate lines:
  "FRESH FOOD", "STONE-BAKED PIZZAS", "SUNDAY ROAST", "BEER GARDEN",
  "QUIZ NIGHTS", "FREE PARKING".
- A green sign above the door reading "THE ANCHOR", and a hanging bracket sign
  reading "THE ANCHOR" with "STANWELL MOOR" beneath it.

Do not render the words: Cask Ales, Real Ale, Traditional Ales, Mulled Wine,
Live Music, Open Fires, Great Sports, Sky, TNT, Welsh Grown. Do not use any
place name other than Stanwell Moor.

All lettering must be correctly spelled real English words. No invented or
distorted text anywhere in the image.

Composition: the pub frontage and the main chalkboard sit within the central
third of the frame. 1920x1080, 16:9, natural photographic lighting, sharp
focus, no people.
```

---

## Month blocks

Append one of these to the base prompt.

**January**
```
Season and light: level 1, the darkest of the year. Well after dark on a
wet January evening. Black-blue sky, bare trees, rain-slicked tarmac throwing
back reflections. Every window warmly lit from inside and the chalkboard
downlights on, so the building glows against the dark.
Main chalkboard reads: "Happy New Year" in gold script on black, with small
star motifs. A small decorated evergreen in the window box beneath it.
```

**February**
```
Season and light: level 2. Early evening, already dark, a hard frost on the
ground. Deep blue dusk sky. All windows warmly lit, small warm-white fairy
lights along the gate.
Main chalkboard reads: "Share the love" in cream script, then "THIS VALENTINE'S"
in small capitals, then "You, Me & A Cosy Pub", with a heart and leaf motifs.
Red and cream paper hearts in the windows.
```

**March**
```
Season and light: level 3. Dusk at the blue hour, with real light still left
in the sky, noticeably lighter than February. Windows lit but no longer the only
light source. The first spring flowers in the window boxes.
Main chalkboard reads: "Happy Mother's Day" in cream script, then
"Celebrate Mum With Us", with floral motifs.
Any bunting in the windows must read "HAPPY MOTHER'S DAY" spelled correctly, or
be plain with no lettering at all.
```

**April**
```
Season and light: level 5, the turn into the lighter half of the year. Late
afternoon sliding into golden hour, soft blue sky with broken cloud. The window
lights are only just coming on and read as warm accents, not the main light.
Main chalkboard reads: "Happy Easter" in cream script, then
"Celebrate Easter With Us", with rabbit, egg and flower motifs.
Pastel decorated eggs in the window boxes.
```

**May**
```
Season and light: level 7. Early evening but still broad daylight, low warm
sun raking across the frontage, long soft shadows. Interior lights barely
visible. Hanging baskets and window boxes in full colour.
Main chalkboard reads: "Cheers to the" then "BANK HOLIDAY!" then
"Longer Days . Good Times . Great Company", with floral line motifs.
```

**June**
```
Season and light: level 9. Afternoon, bright blue sky with a few white
clouds, strong even daylight on the building. No interior lights showing.
Hanging baskets at their fullest.
Main chalkboard reads: "Cheers, Dad!" in cream script, then "FATHER'S DAY" and
"AT THE ANCHOR" in capitals, then "GOOD FOOD . COLD PINTS . GREAT COMPANY" in
pale blue, with a small anchor motif and a blue heart.
```

**July**
```
Season and light: level 10, the brightest image of the twelve. Midday high
summer, strong direct sun, deep blue sky, hard shadows on the forecourt, no
interior lights at all.
Main chalkboard reads: "Hello Summer" in cream and gold script, then
"COLD DRINKS . SUNNY DAYS" and "GOOD TIMES" in pale blue, with a sun motif and
a small anchor.
```

**August**
```
Season and light: level 9, a shade off July. Warm bright afternoon, deep blue
sky, full sun on the frontage, no interior lights.
Main chalkboard reads: "August Sunshine" in gold script, then
"COLD DRINKS . SUNNY DAYS . GOOD TIMES", with a sun motif and a small anchor.
```

**September**
```
Season and light: level 7, the first step down. Late afternoon golden light,
pale sky softening towards evening, longer shadows. Interior lights off or only
just on. Window boxes still in flower but starting to go over.
Main chalkboard reads: "Hello September" in cream script, then
"Cooler Days . Cosy Pints . Good Times", with small autumn leaf and flower
motifs and a small anchor.
```

**October**
```
Season and light: level 5. Late afternoon sliding into dusk, overcast, grey
sky with a little gold left in it. Interior lights coming on and starting to
matter. Fallen leaves across the forecourt.
Main chalkboard reads: "Happy Halloween" in cream script, then
"Spooky Sips . Cosy Nights . Good Times", with pumpkin and swirl motifs.
Carved pumpkins on the steps and in the window boxes.
Note the A-board must read "Proper Pub", singular, not "Proper Pubs".
```

**November**
```
Season and light: level 3. Dusk and nearly dark, heavy grey cloud, the last
of the daylight going. Windows fully lit and carrying the image, the chalkboard
downlights on.
Main chalkboard reads exactly: "Lest We Forget" in large cream script, then
"Remembrance at The Anchor" beneath it, with two red poppies either side.
There must be no stray characters before the word "Lest".
The A-frame board reads: "Proud to Remember", "Thank You", a single red poppy,
then "Lest We Forget".
Red poppies in the window boxes and hanging baskets.
```

**December**
```
Season and light: level 1, as dark as January but warmer and sparkling. Well
after dark, deep blue-black sky. Every window lit, warm-white icicle lights
strung along every roofline and gable so the whole frontage glows.
Main chalkboard reads: "Merry Christmas" in gold script, then
"Celebrate the season with us", with snowflake and holly motifs.
Garlands with red berries in the window boxes, small lit Christmas trees either
side of the door.
The A-frame board reads: "GREENE KING", "Festive Menu", "THE ANCHOR",
"STANWELL MOOR".
Do not render the words Mulled Wine anywhere.
```
