# Food Menu Content Refresh — Design Spec

**Date:** 2026-03-19
**Scope:** `content/menu/food.json` + `app/food-menu/page.tsx`
**Status:** Approved for implementation

---

## Goal

Refresh the `/food-menu` page so that it reflects the new menu structure exactly, in the correct order, with copy written in a warm classic British pub voice — tempting people with honest food, community spirit, and a sense of belonging.

---

## What Changes

### 1. `content/menu/food.json` — Full rebuild

Replace the file entirely. The existing categories `light-bites`, `snack-pots`, and `mains` are dissolved — their content is redistributed into the new structure below. The existing `burgers` category is replaced (burger stacks removed). `pizza`, `desserts`, and `hot-drinks` carry over with targeted changes.

`lastUpdated` set to `2026-03-19`.

**Deliberately removed items:**
- Lamb Shank (£22.99) — removed
- Beef Stack, Spicy Chicken Stack, Chicken Stack, Veggie Stack — removed
- Speck Ham & Parmesan pizza — removed

**`featured` field:** Drop from all items. Not used in the new structure.

**Copy tone for food item descriptions:** Warm, unpretentious, classic pub. Evocative of comfort and tradition — not clinical or listy.
- ✅ "Slow-cooked beef in a rich ale gravy, sealed in golden pastry — proper pub comfort on a plate."
- ❌ "Tender slow-cooked beef in a hearty ale gravy, wrapped in golden pastry. Served with buttery mash and seasonal vegetables."

Implementer writes all item descriptions and category-level `description` strings in this tone. Hot drinks descriptions carry over as-is from existing file.

---

#### Category 1 — `pub-classics` — British Pub Classics

Category description: "Proper British pub favourites, full of comfort and flavour."

Single section, `title: ""`, `style: "grid"`.

| Name | Price | Allergens | Vegetarian |
|------|-------|-----------|------------|
| Fish & Chips | 14.99 | `["gluten", "fish"]` | false |
| Half Fish & Chips | 11.99 | `["gluten", "fish"]` | false |
| Scampi & Chips | 12.99 | `["gluten", "crustaceans", "eggs"]` | false |
| Jumbo Sausage & Chips | 12.99 | `["gluten", "soya", "sulphites"]` | false |
| Bangers & Mash | 13.99 | `["gluten", "milk", "sulphites"]` | false |

Bangers & Mash description: "Three sausages on creamy mash with crispy onions and rich onion gravy — a timeless pub classic."

---

#### Category 2 — `pies` — Traditional British Pies

Category description: "Golden pastry, rich fillings and proper pub comfort. All pies served with creamy mash and seasonal veg — swap for chips if you prefer."

Single section, `title: ""`, `style: "grid"`.

| Name | Price | Allergens | Vegetarian |
|------|-------|-----------|------------|
| Beef & Ale Pie | 15.99 | `["celery", "gluten", "eggs", "milk"]` | false |
| Chicken & Wild Mushroom Pie | 14.99 | `["gluten", "eggs", "milk", "nuts"]` | false |
| Chicken, Ham Hock & Leek Pie | 14.99 | `["gluten", "eggs", "milk", "celery"]` | false — **NEW** |
| Butternut Squash, Mixed Bean & Mature Cheddar Pie | 14.99 | `["gluten", "eggs", "milk"]` | true — **NEW** |

---

#### Category 3 — `burgers` — House Burgers

Category description: "Straightforward burgers, proper portions and easy extras. All burgers served with chips, salad and your choice of sauce."

**Section 1 — `title: ""`, `style: "grid"`**

| Name | Price | Allergens | Vegetarian |
|------|-------|-----------|------------|
| Classic Beef Burger | 9.99 | `["gluten"]` | false |
| Chicken Burger | 9.99 | `["gluten", "milk"]` | false |
| Spicy Chicken Burger | 9.99 | `["gluten"]` | false |
| Katsu Chicken Burger | 12.99 | `["gluten", "milk"]` | false |
| Garden Veg Burger | 9.99 | `["gluten", "soya"]` | true |

Note: existing "Beef Burger" renamed to "Classic Beef Burger"; peanuts removed from allergens (confirmed by operator). Existing "Vegetable Burger" renamed to "Garden Veg Burger"; allergens unchanged.

**Section 2 — `title: "Burger Add-Ons"`, `style: "list"`**

Section description: "Customise your burger."

```json
[
  { "name": "Add mature cheddar", "price": "1.50", "description": "", "allergens": ["milk"], "vegetarian": true },
  { "name": "Add bacon", "price": "1.50", "description": "", "allergens": [], "vegetarian": false },
  { "name": "Add hash brown", "price": "1.00", "description": "", "allergens": ["gluten"], "vegetarian": true },
  { "name": "Add onion ring", "price": "1.00", "description": "", "allergens": ["gluten"], "vegetarian": true },
  { "name": "Upgrade to cheesy chips", "price": "1.50", "description": "", "allergens": ["milk"], "vegetarian": true },
  { "name": "Swap to sweet potato fries", "price": "1.00", "description": "", "allergens": [], "vegetarian": true }
]
```

---

#### Category 4 — `comfort-favourites` — Comfort Favourites

Category description: "Warm, satisfying dishes for when you want something hearty."

Single section, `title: ""`, `style: "grid"`.

| Name | Price | Allergens | Vegetarian |
|------|-------|-----------|------------|
| Lasagne | 14.99 | `["gluten", "eggs", "milk"]` | false |
| Mac & Cheese | 13.99 | `["gluten", "milk", "mustard"]` | true |
| Spinach & Ricotta Cannelloni | 13.99 | `["gluten", "eggs", "milk"]` | true |
| Chicken Katsu Curry | 13.99 | `["gluten", "milk", "sulphites"]` | false |

Note: existing "Mac 'N Cheese" renamed to "Mac & Cheese".

---

#### Category 5 — `pizza` — Stone-Baked Pizza

Category description: "Stone-baked to order with crisp bases and generous toppings. 12-inch gluten-free bases available on request."

**Section 1 — `title: "Pizza Selection"`, `style: "grid"`**

All prices, allergens, descriptions, and `glutenFreeAvailable: true` flags carry over from existing file. Remove Speck Ham & Parmesan. Speck ham remains as an ingredient in Fully Loaded — its existing description carries over unchanged.

Retained pizzas: Rustic Classic, Simply Salami, Fully Loaded, Nice & Spicy, The Garden Club, Smoked Chilli Chicken, Chicken & Pesto, Barbecue Chicken.

**Section 2 — `title: "Garlic Bread"`, `style: "grid"`**

Carry over entirely unchanged: Garlic Bread £9.49, Garlic Bread with Mozzarella £11.49, allergens and descriptions unchanged.

---

#### Category 6 — `wraps-sides` — Wraps, Smaller Plates & Sides

Category description: "Easy choices for lighter appetites, casual orders and the table."

**Section 1 — `title: "Wraps & Smaller Plates"`, `style: "grid"`**

Note: "Chicken Goujon Wrap with Chips" shortened to "Chicken Goujon Wrap"; "Fish Finger Wrap with Chips" shortened to "Fish Finger Wrap"; "4 Chicken Goujons with Chips" updated to "4 Chicken Goujons & Chips". All allergens carry over.

| Name | Price | Allergens | Vegetarian |
|------|-------|-----------|------------|
| Chicken Goujon Wrap | 9.99 | `["gluten"]` | false |
| Fish Finger Wrap | 9.99 | `["gluten", "fish"]` | false |
| 4 Chicken Goujons & Chips | 8.49 | `["gluten"]` | false |
| 5 Salt & Chilli Squid & Chips | 8.49 | `["gluten", "molluscs"]` | false |
| 3 Fish Fingers & Chips | 8.49 | `["gluten", "fish"]` | false |

**Section 2 — `title: "Sides"`, `style: "list"`**

| Name | Price | Allergens | Vegetarian |
|------|-------|-----------|------------|
| Chips | 3.49 | `[]` | true |
| Chunky Chips | 4.49 | `[]` | true |
| Cheesy Chips | 4.99 | `["milk"]` | true |
| Sweet Potato Fries | 4.49 | `[]` | true |
| 6 Onion Rings | 3.49 | `["gluten"]` | true |

---

#### Category 7 — `desserts` — Proper Puddings

Category description: "Warm pub puddings and sweet favourites to finish."

Single section, `title: ""`, `style: "grid"`.

| Name | Price | Allergens | Vegetarian | Notes |
|------|-------|-----------|------------|-------|
| Sticky Toffee Pudding | 5.99 | `["eggs"]` | true | Gluten-free — confirmed by operator |
| Apple Crumble | 5.99 | `["gluten"]` | true | |
| Chocolate Fudge Brownie | 5.99 | `["eggs", "milk", "soya"]` | true | |
| Chocolate Fudge Cake | 5.99 | `["gluten", "eggs", "milk"]` | true | **NEW** |
| Ice Cream Sundae | 4.99 | `["milk"]` | true | |

---

#### Category 8 — `hot-drinks` — Hot Drinks

Descriptions carry over as-is. Allergens as below (carry over from existing file).

| Name | Price | Allergens |
|------|-------|-----------|
| Americano | 2.10 | `[]` |
| Latte | 2.50 | `["milk"]` |
| Cappuccino | 2.50 | `["milk"]` |
| Hot Chocolate | 2.40 | `["milk"]` |
| Individual Pot of Tea | 2.20 | `[]` |

---

### 2. `app/food-menu/page.tsx` — Editorial copy updates

Copy-only changes. No JSX structure, className, logic, or component changes.

**`MENU_SECTION_LIST`** — intentionally curated subset for structured data, not exhaustive:
```
1. British Pub Classics  → https://www.the-anchor.pub/food-menu#pub-classics
2. Traditional British Pies → https://www.the-anchor.pub/food-menu#pies
3. Stone-Baked Pizza     → https://www.the-anchor.pub/food-menu#pizza
4. Comfort Favourites    → https://www.the-anchor.pub/food-menu#comfort-favourites
5. Near Heathrow         → https://www.the-anchor.pub/food-menu#near-heathrow
```

**Hero description:** Rewrite to lead with pub identity and warmth. Location as supporting context. Tone: inviting, community-minded, food-first.

**Intro card:** Rewrite body copy and bullet points. Lead with community warmth and honest food. Staines/Heathrow location detail as supporting paragraph, not the hook.

**"What Guests Book Us For" feature grid:** Rewrite all four card descriptions in warm pub voice.

**"Pub Classics Done Properly" section:**
- Remove "Double-stacked burgers" bullet
- Fix "minted peas" → "mushy peas"
- Add a line referencing pies
- Rewrite body in warm pub tone

**Dietary section:**
- "Vegetable burger" → "Garden Veg Burger"
- Fix Garden Club description: "roasted courgettes, caramelised onions, rocket" (not "grilled courgette, peppers, balsamic glaze")

**FAQ — fish & chips answer:** "minted peas" → "mushy peas"

---

### 3. What does NOT change

- Sunday Roast section in page.tsx (lines 452–510) — untouched
- Near Heathrow section — untouched
- Customer review quotes — untouched
- All CTAs, BookTableButton, MenuSectionCta instances
- All React component imports and usage
- FilteredMenuRenderer
- SEO metadata titles and descriptions
- Kitchen hours logic, schema markup logic, tracking components
- `#pizza` anchor ID preserved (driven by category `id` field, not title)

---

## Success Criteria

- [ ] food.json has exactly 8 categories in the specified order
- [ ] All removed items absent; all new items present with correct prices
- [ ] Food item descriptions in warm, classic British pub voice throughout
- [ ] Hot drinks descriptions carried over unchanged
- [ ] `featured` field absent from all items
- [ ] Burger add-ons in a separate `style: "list"` sub-section within burgers
- [ ] Single-section categories use a proper sections wrapper (even with empty title)
- [ ] page.tsx has no references to double-stacked burgers or minted peas
- [ ] "Garden Veg Burger" in dietary section
- [ ] Sunday Roast section in page.tsx unchanged
- [ ] Build passes with no type errors
