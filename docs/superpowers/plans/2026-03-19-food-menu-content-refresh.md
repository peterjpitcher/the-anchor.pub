# Food Menu Content Refresh — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `content/menu/food.json` with a new 8-category structure and warm British pub copy, and update hardcoded editorial copy in `app/food-menu/page.tsx` to match.

**Architecture:** `food.json` is a pure data file consumed by `FilteredMenuRenderer` via `parseMenuMarkdown()` in `lib/menu-parser.ts`. The page also has hardcoded editorial sections that reference specific menu items — these are updated independently. No component or logic changes required.

**Tech Stack:** Next.js 14 App Router, TypeScript, Jest (tests in `tests/unit/`), JSON data files in `content/menu/`

**Spec:** `docs/superpowers/specs/2026-03-19-food-menu-content-refresh.md`

---

## Files

| Action | Path | Purpose |
|--------|------|---------|
| Modify | `content/menu/food.json` | Full rebuild — new 8-category structure |
| Modify | `app/food-menu/page.tsx` | Editorial copy updates only |
| Create | `tests/unit/food-menu-data.test.ts` | Structural validation of food.json |

---

## Task 1: Write failing structural test for food.json

**Files:**
- Create: `tests/unit/food-menu-data.test.ts`

- [ ] **Step 1.1: Create the test file**

```typescript
// tests/unit/food-menu-data.test.ts
import fs from 'fs'
import path from 'path'

const menuPath = path.join(process.cwd(), 'content', 'menu', 'food.json')
const menu = JSON.parse(fs.readFileSync(menuPath, 'utf8'))

describe('food.json structure', () => {
  it('has exactly 8 categories', () => {
    expect(menu.categories).toHaveLength(8)
  })

  it('has categories in correct order', () => {
    const ids = menu.categories.map((c: { id: string }) => c.id)
    expect(ids).toEqual([
      'pub-classics',
      'pies',
      'burgers',
      'comfort-favourites',
      'pizza',
      'wraps-sides',
      'desserts',
      'hot-drinks',
    ])
  })

  it('every category has id, title, description, and sections array', () => {
    for (const cat of menu.categories) {
      expect(typeof cat.id).toBe('string')
      expect(typeof cat.title).toBe('string')
      expect(typeof cat.description).toBe('string')
      expect(Array.isArray(cat.sections)).toBe(true)
    }
  })

  it('every item has name, price, allergens array, and vegetarian flag', () => {
    for (const cat of menu.categories) {
      for (const section of cat.sections) {
        for (const item of section.items) {
          expect(typeof item.name).toBe('string')
          expect(typeof item.price).toBe('string')
          expect(Array.isArray(item.allergens)).toBe(true)
          expect(typeof item.vegetarian).toBe('boolean')
        }
      }
    }
  })

  it('no item has a featured field', () => {
    for (const cat of menu.categories) {
      for (const section of cat.sections) {
        for (const item of section.items) {
          expect(item.featured).toBeUndefined()
        }
      }
    }
  })

  it('contains new items', () => {
    const allNames = menu.categories.flatMap((c: { sections: { items: { name: string }[] }[] }) =>
      c.sections.flatMap(s => s.items.map(i => i.name))
    )
    expect(allNames).toContain('Chicken, Ham Hock & Leek Pie')
    expect(allNames).toContain('Butternut Squash, Mixed Bean & Mature Cheddar Pie')
    expect(allNames).toContain('Chocolate Fudge Cake')
    expect(allNames).toContain('Chocolate Fudge Brownie')
    expect(allNames).toContain('Garden Veg Burger')
    expect(allNames).toContain('Classic Beef Burger')
    expect(allNames).toContain('Bangers & Mash')
  })

  it('does not contain removed items', () => {
    const allNames = menu.categories.flatMap((c: { sections: { items: { name: string }[] }[] }) =>
      c.sections.flatMap(s => s.items.map(i => i.name))
    )
    expect(allNames).not.toContain('Lamb Shank')
    expect(allNames).not.toContain('Beef Stack')
    expect(allNames).not.toContain('Spicy Chicken Stack')
    expect(allNames).not.toContain('Chicken Stack')
    expect(allNames).not.toContain('Veggie Stack')
    expect(allNames).not.toContain('Speck Ham & Parmesan')
    expect(allNames).not.toContain('Beef Burger')
    expect(allNames).not.toContain('Vegetable Burger')
    expect(allNames).not.toContain('Sausage & Mash')
  })

  it('burgers category has an add-ons section', () => {
    const burgers = menu.categories.find((c: { id: string }) => c.id === 'burgers')
    const addOns = burgers?.sections.find((s: { title: string }) => s.title === 'Burger Add-Ons')
    expect(addOns).toBeDefined()
    expect(addOns.style).toBe('list')
    expect(addOns.items.length).toBeGreaterThanOrEqual(6)
  })

  it('Classic Beef Burger does not have peanuts allergen', () => {
    const burgers = menu.categories.find((c: { id: string }) => c.id === 'burgers')
    const beefBurger = burgers?.sections
      .flatMap((s: { items: { name: string; allergens: string[] }[] }) => s.items)
      .find((i: { name: string }) => i.name === 'Classic Beef Burger')
    expect(beefBurger?.allergens).not.toContain('peanuts')
  })

  it('Sticky Toffee Pudding does not have gluten allergen (operator confirmed gluten-free)', () => {
    const desserts = menu.categories.find((c: { id: string }) => c.id === 'desserts')
    const stp = desserts?.sections
      .flatMap((s: { items: { name: string; allergens: string[] }[] }) => s.items)
      .find((i: { name: string }) => i.name === 'Sticky Toffee Pudding')
    expect(stp?.allergens).not.toContain('gluten')
  })
})
```

- [ ] **Step 1.2: Run the test to confirm it fails**

```bash
cd /Users/peterpitcher/Cursor/OJ-The-Anchor.pub && npx jest tests/unit/food-menu-data.test.ts --no-coverage
```

Expected: Multiple failures — wrong category count, wrong IDs, missing new items, removed items still present.

- [ ] **Step 1.3: Commit the failing test**

```bash
git add tests/unit/food-menu-data.test.ts
git commit -m "test: add structural validation for food.json menu rebuild"
```

---

## Task 2: Rebuild food.json

**Files:**
- Modify: `content/menu/food.json`

Replace the entire file with the content below. Every item description uses warm, classic British pub language — evocative, unpretentious, and inviting.

- [ ] **Step 2.1: Replace content/menu/food.json with the new content**

```json
{
  "title": "Food Menu",
  "description": "Proper British pub food at The Anchor — cooked fresh to order and served with a warm welcome.",
  "lastUpdated": "2026-03-19",
  "categories": [
    {
      "id": "pub-classics",
      "title": "British Pub Classics",
      "description": "Proper British pub favourites, full of comfort and flavour.",
      "sections": [
        {
          "title": "",
          "style": "grid",
          "items": [
            {
              "name": "Fish & Chips",
              "price": "14.99",
              "description": "Golden beer-battered fish with chunky chips, mushy peas, tartare sauce and a wedge of lemon — a proper British classic.",
              "allergens": ["gluten", "fish"],
              "vegetarian": false
            },
            {
              "name": "Half Fish & Chips",
              "price": "11.99",
              "description": "All the flavour of our fish supper in a lighter portion — chunky chips, mushy peas, tartare sauce and lemon.",
              "allergens": ["gluten", "fish"],
              "vegetarian": false
            },
            {
              "name": "Scampi & Chips",
              "price": "12.99",
              "description": "Crispy golden scampi with chunky chips, mushy peas, tartare sauce and lemon — simple, satisfying and full of flavour.",
              "allergens": ["gluten", "crustaceans", "eggs"],
              "vegetarian": false
            },
            {
              "name": "Jumbo Sausage & Chips",
              "price": "12.99",
              "description": "A proper jumbo sausage with chunky chips, mushy peas and your choice of sauce — honest pub grub at its best.",
              "allergens": ["gluten", "soya", "sulphites"],
              "vegetarian": false
            },
            {
              "name": "Bangers & Mash",
              "price": "13.99",
              "description": "Three sausages on creamy mash with crispy onions and rich onion gravy — a timeless pub classic.",
              "allergens": ["gluten", "milk", "sulphites"],
              "vegetarian": false
            }
          ]
        }
      ]
    },
    {
      "id": "pies",
      "title": "Traditional British Pies",
      "description": "Golden pastry, rich fillings and proper pub comfort. All pies are served with creamy mash and seasonal veg — swap your mash for chips if you prefer.",
      "sections": [
        {
          "title": "",
          "style": "grid",
          "items": [
            {
              "name": "Beef & Ale Pie",
              "price": "15.99",
              "description": "Slow-cooked beef in a rich ale gravy, sealed in golden pastry — proper pub comfort on a plate.",
              "allergens": ["celery", "gluten", "eggs", "milk"],
              "vegetarian": false
            },
            {
              "name": "Chicken & Wild Mushroom Pie",
              "price": "14.99",
              "description": "Tender chicken and earthy wild mushrooms in a creamy sauce, baked in flaky pastry until golden.",
              "allergens": ["gluten", "eggs", "milk", "nuts"],
              "vegetarian": false
            },
            {
              "name": "Chicken, Ham Hock & Leek Pie",
              "price": "14.99",
              "description": "Chicken, slow-cooked ham hock and tender leeks in a rich creamy sauce, wrapped in crisp golden pastry.",
              "allergens": ["gluten", "eggs", "milk", "celery"],
              "vegetarian": false
            },
            {
              "name": "Butternut Squash, Mixed Bean & Mature Cheddar Pie",
              "price": "14.99",
              "description": "Butternut squash, mixed beans and mature cheddar in a gently spiced tomato sauce, baked in crisp pastry.",
              "allergens": ["gluten", "eggs", "milk"],
              "vegetarian": true
            }
          ]
        }
      ]
    },
    {
      "id": "burgers",
      "title": "House Burgers",
      "description": "Straightforward burgers, proper portions and easy extras. All burgers are served with chips, salad and your choice of sauce.",
      "sections": [
        {
          "title": "",
          "style": "grid",
          "items": [
            {
              "name": "Classic Beef Burger",
              "price": "9.99",
              "description": "A proper beef burger, simply done and easy to love — served with chips, salad and your choice of sauce.",
              "allergens": ["gluten"],
              "vegetarian": false
            },
            {
              "name": "Chicken Burger",
              "price": "9.99",
              "description": "Breaded chicken fillet with salad and your choice of sauce — a crowd-pleaser done properly.",
              "allergens": ["gluten", "milk"],
              "vegetarian": false
            },
            {
              "name": "Spicy Chicken Burger",
              "price": "9.99",
              "description": "Crispy spicy chicken with salad and your choice of sauce — for those who like a bit of fire.",
              "allergens": ["gluten"],
              "vegetarian": false
            },
            {
              "name": "Katsu Chicken Burger",
              "price": "12.99",
              "description": "Breaded chicken fillet topped with fragrant katsu curry sauce and fresh cucumber — a proper crowd favourite.",
              "allergens": ["gluten", "milk"],
              "vegetarian": false
            },
            {
              "name": "Garden Veg Burger",
              "price": "9.99",
              "description": "A hearty veggie patty with salad and your choice of sauce — satisfying and full of flavour.",
              "allergens": ["gluten", "soya"],
              "vegetarian": true
            }
          ]
        },
        {
          "title": "Burger Add-Ons",
          "description": "Customise your burger.",
          "style": "list",
          "items": [
            {
              "name": "Add mature cheddar",
              "price": "1.50",
              "description": "",
              "allergens": ["milk"],
              "vegetarian": true
            },
            {
              "name": "Add bacon",
              "price": "1.50",
              "description": "",
              "allergens": [],
              "vegetarian": false
            },
            {
              "name": "Add hash brown",
              "price": "1.00",
              "description": "",
              "allergens": ["gluten"],
              "vegetarian": true
            },
            {
              "name": "Add onion ring",
              "price": "1.00",
              "description": "",
              "allergens": ["gluten"],
              "vegetarian": true
            },
            {
              "name": "Upgrade to cheesy chips",
              "price": "1.50",
              "description": "",
              "allergens": ["milk"],
              "vegetarian": true
            },
            {
              "name": "Swap to sweet potato fries",
              "price": "1.00",
              "description": "",
              "allergens": [],
              "vegetarian": true
            }
          ]
        }
      ]
    },
    {
      "id": "comfort-favourites",
      "title": "Comfort Favourites",
      "description": "Warm, satisfying dishes for when you want something hearty.",
      "sections": [
        {
          "title": "",
          "style": "grid",
          "items": [
            {
              "name": "Lasagne",
              "price": "14.99",
              "description": "Rich beef lasagne baked until golden, served with salad and garlic bread — the kind of dish that feels like home.",
              "allergens": ["gluten", "eggs", "milk"],
              "vegetarian": false
            },
            {
              "name": "Mac & Cheese",
              "price": "13.99",
              "description": "Creamy macaroni cheese topped with crispy onions, served with salad and garlic bread — pure comfort in a bowl.",
              "allergens": ["gluten", "milk", "mustard"],
              "vegetarian": true
            },
            {
              "name": "Spinach & Ricotta Cannelloni",
              "price": "13.99",
              "description": "Spinach and ricotta cannelloni baked in tomato sauce, served with salad and garlic bread — warm, satisfying and homely.",
              "allergens": ["gluten", "eggs", "milk"],
              "vegetarian": true
            },
            {
              "name": "Chicken Katsu Curry",
              "price": "13.99",
              "description": "Crispy breaded chicken on fluffy rice with aromatic katsu curry sauce — a pub favourite with a twist.",
              "allergens": ["gluten", "milk", "sulphites"],
              "vegetarian": false
            }
          ]
        }
      ]
    },
    {
      "id": "pizza",
      "title": "Stone-Baked Pizza",
      "description": "Stone-baked to order with crisp bases and generous toppings. 12-inch gluten-free bases available on request.",
      "sections": [
        {
          "title": "Pizza Selection",
          "description": "Stone-baked to order on hand-stretched bases. All 12-inch pizzas are available with a gluten-free base on request — just ask when ordering.",
          "style": "grid",
          "items": [
            {
              "name": "Rustic Classic",
              "price": "10.49 (GF available)",
              "description": "Rich tomato sauce, creamy mozzarella, crisp stone-baked crust — a timeless favourite. Available with gluten-free base.",
              "allergens": ["gluten", "milk", "soya"],
              "vegetarian": true,
              "glutenFreeAvailable": true
            },
            {
              "name": "Simply Salami",
              "price": "12.99 (GF available)",
              "description": "Napoli salami, tangy tomato sauce and mozzarella, stone-baked to crispy perfection. Available with gluten-free base.",
              "allergens": ["gluten", "milk", "soya"],
              "vegetarian": false,
              "glutenFreeAvailable": true
            },
            {
              "name": "Fully Loaded",
              "price": "13.99 (GF available)",
              "description": "Napoli salami, speck ham, fennel salami and mozzarella on a bold stone-baked base. Available with gluten-free base.",
              "allergens": ["gluten", "milk", "soya"],
              "vegetarian": false,
              "glutenFreeAvailable": true
            },
            {
              "name": "Nice & Spicy",
              "price": "13.49 (GF available)",
              "description": "'Nduja, Ventricina, roquito peppers and mozzarella — fiery flavours on a crisp crust. Available with gluten-free base.",
              "allergens": ["gluten", "milk", "soya"],
              "vegetarian": false,
              "glutenFreeAvailable": true
            },
            {
              "name": "The Garden Club",
              "price": "12.99 (GF available)",
              "description": "Roasted courgettes, caramelised onions, rocket and mozzarella on a rich tomato base. Available with gluten-free base.",
              "allergens": ["gluten", "milk", "soya", "sulphites"],
              "vegetarian": true,
              "glutenFreeAvailable": true
            },
            {
              "name": "Smoked Chilli Chicken",
              "price": "13.49 (GF available)",
              "description": "Smoky paprika base with chicken, mozzarella and roquito peppers for a spicy-savoury bite. Available with gluten-free base.",
              "allergens": ["gluten", "milk", "soya"],
              "vegetarian": false,
              "glutenFreeAvailable": true
            },
            {
              "name": "Chicken & Pesto",
              "price": "13.49 (GF available)",
              "description": "Tender chicken, basil pesto and melted mozzarella on a crisp stone-baked crust. Available with gluten-free base.",
              "allergens": ["gluten", "milk", "soya"],
              "vegetarian": false,
              "glutenFreeAvailable": true
            },
            {
              "name": "Barbecue Chicken",
              "price": "13.99 (GF available)",
              "description": "Sweet and smoky BBQ sauce, chicken, speck ham and mozzarella on a crunchy crust. Available with gluten-free base.",
              "allergens": ["gluten", "milk", "soya", "sulphites"],
              "vegetarian": false,
              "glutenFreeAvailable": true
            }
          ]
        },
        {
          "title": "Garlic Bread",
          "description": "Baked in the same stone oven as our pizzas — golden and crisp on the outside with a soft, garlicky centre.",
          "style": "grid",
          "items": [
            {
              "name": "Stone-Baked Garlic Bread",
              "price": "9.49",
              "description": "Stone-baked bread brushed with garlic butter, warm and crispy every time.",
              "allergens": ["gluten", "milk", "soya"],
              "vegetarian": true
            },
            {
              "name": "Garlic Bread with Mozzarella",
              "price": "11.49",
              "description": "Warm garlic bread crowned with melted mozzarella — a proper shareable.",
              "allergens": ["gluten", "milk", "soya"],
              "vegetarian": true
            }
          ]
        }
      ]
    },
    {
      "id": "wraps-sides",
      "title": "Wraps, Smaller Plates & Sides",
      "description": "Easy choices for lighter appetites, casual orders and the table.",
      "sections": [
        {
          "title": "Wraps & Smaller Plates",
          "description": "Quick, satisfying and easy to eat — great for a lighter bite or a snack alongside a drink.",
          "style": "grid",
          "items": [
            {
              "name": "Chicken Goujon Wrap",
              "price": "9.99",
              "description": "Crispy chicken goujons in a soft wrap with salad and chips — a proper handheld lunch.",
              "allergens": ["gluten"],
              "vegetarian": false
            },
            {
              "name": "Fish Finger Wrap",
              "price": "9.99",
              "description": "Golden fish fingers in a soft wrap with salad and chips — a pub classic in a new form.",
              "allergens": ["gluten", "fish"],
              "vegetarian": false
            },
            {
              "name": "4 Chicken Goujons & Chips",
              "price": "8.49",
              "description": "Crispy chicken goujons with chips and your choice of dip — great for sharing or keeping all to yourself.",
              "allergens": ["gluten"],
              "vegetarian": false
            },
            {
              "name": "5 Salt & Chilli Squid & Chips",
              "price": "8.49",
              "description": "Salt and chilli squid with chips and your choice of dip — light, crispy and full of flavour.",
              "allergens": ["gluten", "molluscs"],
              "vegetarian": false
            },
            {
              "name": "3 Fish Fingers & Chips",
              "price": "8.49",
              "description": "Golden fish fingers with chips and your choice of dip — a proper British favourite.",
              "allergens": ["gluten", "fish"],
              "vegetarian": false
            }
          ]
        },
        {
          "title": "Sides",
          "description": "The essentials — perfect for sharing or adding to any plate.",
          "style": "list",
          "items": [
            {
              "name": "Chips",
              "price": "3.49",
              "description": "Skin-on chips fried to order and finished with sea salt.",
              "allergens": [],
              "vegetarian": true
            },
            {
              "name": "Chunky Chips",
              "price": "4.49",
              "description": "Thick-cut pub chips with a fluffy centre and crisp exterior.",
              "allergens": [],
              "vegetarian": true
            },
            {
              "name": "Cheesy Chips",
              "price": "4.99",
              "description": "Golden chips under a blanket of melted mature cheddar.",
              "allergens": ["milk"],
              "vegetarian": true
            },
            {
              "name": "Sweet Potato Fries",
              "price": "4.49",
              "description": "Lightly spiced sweet potato fries — perfect alongside anything on the menu.",
              "allergens": [],
              "vegetarian": true
            },
            {
              "name": "6 Onion Rings",
              "price": "3.49",
              "description": "Beer-battered onion rings, golden and crisp — a proper table sharer.",
              "allergens": ["gluten"],
              "vegetarian": true
            }
          ]
        }
      ]
    },
    {
      "id": "desserts",
      "title": "Proper Puddings",
      "description": "Warm pub puddings and sweet favourites to finish.",
      "sections": [
        {
          "title": "",
          "style": "grid",
          "items": [
            {
              "name": "Sticky Toffee Pudding",
              "price": "5.99",
              "description": "Rich sponge in toffee sauce, served warm with custard — the pudding that earns its place every time.",
              "allergens": ["eggs"],
              "vegetarian": true
            },
            {
              "name": "Apple Crumble",
              "price": "5.99",
              "description": "Warm apple crumble served with custard or ice cream — a proper British pud.",
              "allergens": ["gluten"],
              "vegetarian": true
            },
            {
              "name": "Chocolate Fudge Brownie",
              "price": "5.99",
              "description": "Warm chocolate brownie with custard or ice cream — gooey, rich and completely worth it.",
              "allergens": ["eggs", "milk", "soya"],
              "vegetarian": true
            },
            {
              "name": "Chocolate Fudge Cake",
              "price": "5.99",
              "description": "Hot chocolate fudge cake with cream or custard — the indulgent finish your meal deserves.",
              "allergens": ["gluten", "eggs", "milk"],
              "vegetarian": true
            },
            {
              "name": "Ice Cream Sundae",
              "price": "4.99",
              "description": "Three scoops of ice cream with chocolate or strawberry sauce — a simple pleasure done right.",
              "allergens": ["milk"],
              "vegetarian": true
            }
          ]
        }
      ]
    },
    {
      "id": "hot-drinks",
      "title": "Hot Drinks",
      "description": "A proper cup to finish your visit — made properly and served without the airport price tag.",
      "sections": [
        {
          "title": "",
          "description": "Freshly made to order.",
          "style": "list",
          "items": [
            {
              "name": "Americano",
              "price": "2.10",
              "description": "Double-shot espresso topped with hot water.",
              "allergens": [],
              "vegetarian": true
            },
            {
              "name": "Latte",
              "price": "2.50",
              "description": "Velvety espresso finished with steamed milk.",
              "allergens": ["milk"],
              "vegetarian": true
            },
            {
              "name": "Cappuccino",
              "price": "2.50",
              "description": "Equal parts espresso, steamed milk and foam.",
              "allergens": ["milk"],
              "vegetarian": true
            },
            {
              "name": "Hot Chocolate",
              "price": "2.40",
              "description": "Creamy cocoa topped with froth.",
              "allergens": ["milk"],
              "vegetarian": true
            },
            {
              "name": "Individual Pot of Tea",
              "price": "2.20",
              "description": "Tetley Tea, Decaffeinated, Earl Grey, Green Tea, Green Tea with Lemon, Mint Fusion, Raspberry & Pomegranate.",
              "allergens": [],
              "vegetarian": true
            }
          ]
        }
      ]
    }
  ]
}
```

---

## Task 3: Verify test passes and commit food.json

- [ ] **Step 3.1: Run the structural test**

```bash
cd /Users/peterpitcher/Cursor/OJ-The-Anchor.pub && npx jest tests/unit/food-menu-data.test.ts --no-coverage
```

Expected: All tests pass.

- [ ] **Step 3.2: Run the full test suite to check for regressions**

```bash
cd /Users/peterpitcher/Cursor/OJ-The-Anchor.pub && npm test -- --no-coverage
```

Expected: All tests pass. No regressions.

- [ ] **Step 3.3: Commit food.json**

```bash
git add content/menu/food.json
git commit -m "content: rebuild food menu with new 8-category structure and British pub copy"
```

---

## Task 4: Update page.tsx editorial copy

**Files:**
- Modify: `app/food-menu/page.tsx`

These are copy-only changes. Do not modify any JSX structure, className, component imports, or logic. Read the file before each edit to confirm the old string is present.

- [ ] **Step 4.1: Update MENU_SECTION_LIST**

Find exact string:
```typescript
const MENU_SECTION_LIST = [
  {
    position: 1,
    name: 'Sunday Roasts',
    url: 'https://www.the-anchor.pub/food-menu#sunday-roast'
  },
  {
    position: 2,
    name: 'Pizza Menu',
    url: 'https://www.the-anchor.pub/food-menu#pizza'
  },
  {
    position: 3,
    name: 'Pub Classics',
    url: 'https://www.the-anchor.pub/food-menu#pub-classics'
  },
  {
    position: 4,
    name: 'Vegetarian & Gluten-Friendly',
    url: 'https://www.the-anchor.pub/food-menu#dietary'
  },
  {
    position: 5,
    name: 'Near Heathrow',
    url: 'https://www.the-anchor.pub/food-menu#near-heathrow'
  }
]
```

Replace with:
```typescript
const MENU_SECTION_LIST = [
  {
    position: 1,
    name: 'British Pub Classics',
    url: 'https://www.the-anchor.pub/food-menu#pub-classics'
  },
  {
    position: 2,
    name: 'Traditional British Pies',
    url: 'https://www.the-anchor.pub/food-menu#pies'
  },
  {
    position: 3,
    name: 'Stone-Baked Pizza',
    url: 'https://www.the-anchor.pub/food-menu#pizza'
  },
  {
    position: 4,
    name: 'Comfort Favourites',
    url: 'https://www.the-anchor.pub/food-menu#comfort-favourites'
  },
  {
    position: 5,
    name: 'Near Heathrow',
    url: 'https://www.the-anchor.pub/food-menu#near-heathrow'
  }
]
```

- [ ] **Step 4.2: Update the Hero description**

Find exact string:
```
description="Sunday roasts from £19.99, stone-baked pizzas and proper pub classics. Free parking, 7 mins from Heathrow — no airport prices."
```

Replace with:
```
description="Proper British pub food, cooked to order. Pies, fish & chips, stone-baked pizzas and Sunday roasts — pull up a chair and make yourself at home."
```

- [ ] **Step 4.3: Update the intro card SectionHeader**

Find exact string:
```
              <SectionHeader
                title="Food Menu & Pub Food Menu for Staines & Heathrow"
                subtitle="Traditional favourites, quick service and free parking just outside the terminals."
              />
```

Replace with:
```
              <SectionHeader
                title="Proper British Pub Food at The Anchor"
                subtitle="Honest food, a warm welcome and a menu that brings people back week after week."
              />
```

- [ ] **Step 4.4: Update the intro card paragraph**

Find exact string:
```
              <p className="text-anchor-cream-text/70">
                Looking for a food menu or pub menu in Staines? We sit on Horton Road in Stanwell Moor,
                just 8 minutes from Staines High Street and 7 minutes from Heathrow Terminal 5. Our pub food menu
                covers Sunday roast and Sunday lunch, a fish & chips menu, a pizza menu, plus vegetarian menu and
                gluten free menu options. It's proper British pub food, cooked to order.
              </p>
```

Replace with:
```
              <p className="text-anchor-cream-text/70">
                The Anchor is the kind of pub where you&apos;re welcome whether you&apos;re a regular or it&apos;s
                your first visit. Our menu is built around the classics — golden pies, beer-battered fish &amp; chips,
                stone-baked pizzas and hearty pub favourites, all cooked fresh to order. Come in, find a seat and
                stay a while.
              </p>
```

- [ ] **Step 4.5: Update the intro card bullet list**

Find exact string:
```
              <ul className="mt-4 space-y-2 text-anchor-cream-text/70">
                <li>• Free parking and easy access from Staines, Ashford and Feltham.</li>
                <li>• Sunday roasts and family-friendly seating every weekend.</li>
                <li>• Stone-baked pizzas and pub classics served during kitchen hours.</li>
              </ul>
```

Replace with:
```
              <ul className="mt-4 space-y-2 text-anchor-cream-text/70">
                <li>• Proper British pub classics, cooked fresh to order every day.</li>
                <li>• Something for everyone — meat, veggie and gluten-friendly options throughout.</li>
                <li>• Easy to reach with free parking, a short drive from Staines and Heathrow.</li>
              </ul>
```

- [ ] **Step 4.6: Update the "What Guests Book Us For" feature grid**

Find exact string:
```tsx
                  description: (
                    <>
                      Book by 1pm Saturday to lock in roasts with Yorkshires, crispy spuds, and rich gravy.
                      <Link
                        href="/sunday-lunch"
                        className="mt-2 block text-anchor-gold font-semibold hover:text-anchor-gold-vivid transition"
                      >
                        View roast options →
                      </Link>
                    </>
                  ),
```
Replace with:
```tsx
                  description: (
                    <>
                      Roasts with all the trimmings — Yorkshires, crispy spuds, rich gravy and a proper welcome.
                      Book by 1pm Saturday to guarantee yours.
                      <Link
                        href="/sunday-lunch"
                        className="mt-2 block text-anchor-gold font-semibold hover:text-anchor-gold-vivid transition"
                      >
                        View roast options →
                      </Link>
                    </>
                  ),
```

Find exact string:
```
                      Hand-stretched dough, stone-baked, and topped to order during kitchen hours.
```
Replace with:
```
                      Hand-stretched bases, stone-baked and loaded with generous toppings. Our pizzas are a firm
                      favourite — and for good reason.
```

Find exact string:
```
                  description: 'Order at the bar or from your table — mains land within 15 minutes.',
```
Replace with:
```
                  description: 'From beer-battered fish & chips to golden pies and hearty burgers — proper British pub food, cooked to order and on your table in minutes.',
```

Find exact string:
```
                  description: 'Vegetarian menu and gluten free menu options, plus gluten-aware bases. Ask us about allergens anytime.',
```
Replace with:
```
                  description: 'Vegetarian mains, a garden veg burger, gluten-aware pizza bases and a team ready to help with any allergen question. Everyone\'s welcome at The Anchor.',
```

- [ ] **Step 4.7: Update the "Pub Classics Done Properly" subtitle**

Find exact string:
```
                  subtitle="Order at the bar or from your table — mains usually land within 15 minutes."
```
Replace with:
```
                  subtitle="Honest British pub food, cooked fresh to order — usually on your table within 15 minutes."
```

- [ ] **Step 4.8: Update the "Pub Classics Done Properly" bullet list**

Find exact string:
```
                <ul className="space-y-3 text-anchor-cream-text/70">
                  <li>• Beer-battered fish &amp; chips with minted peas and tartar sauce.</li>
                  <li>• Double-stacked burgers with thick-cut chips and optional upgrades.</li>
                  <li>• Chicken katsu, pies, curries and hearty pub favourites served hot.</li>
                  <li>• Quick enough for lunch breaks or pre-flight dinners.</li>
                </ul>
```
Replace with:
```
                <ul className="space-y-3 text-anchor-cream-text/70">
                  <li>• Beer-battered fish &amp; chips with mushy peas and tartare sauce.</li>
                  <li>• Golden pies with rich fillings, baked in crisp pastry and served with mash.</li>
                  <li>• Chicken katsu, lasagne, mac &amp; cheese and hearty pub favourites cooked fresh.</li>
                  <li>• Quick enough for lunch breaks or pre-flight dinners.</li>
                </ul>
```

- [ ] **Step 4.9: Update the dietary section subtitle**

Find exact string:
```
                subtitle="Dedicated veggie mains, pizzas with gluten-aware bases, and staff ready to help with any allergen query."
```
Replace with:
```
                subtitle="Dedicated veggie mains, gluten-aware pizza bases and a team always happy to help with allergen queries."
```

- [ ] **Step 4.10: Update dietary section bullet — Vegetable burger**

Find exact string:
```
                    <li>• Vegetable burger served with chips and house salad.</li>
```
Replace with:
```
                    <li>• Garden Veg Burger served with chips and salad — a proper veggie option.</li>
```

- [ ] **Step 4.11: Update dietary section bullet — Garden Club pizza**

Find exact string:
```
                    <li>• Garden Club pizza with grilled courgette, peppers, and balsamic glaze.</li>
```
Replace with:
```
                    <li>• Garden Club pizza with roasted courgettes, caramelised onions and rocket.</li>
```

- [ ] **Step 4.12: Verify no "minted peas" remains anywhere in page.tsx**

```bash
grep -n "minted" /Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/food-menu/page.tsx
```

Expected: no output.

- [ ] **Step 4.13: Commit page.tsx changes**

```bash
git add app/food-menu/page.tsx
git commit -m "content: update food-menu page editorial copy — warm pub voice, correct item references"
```

---

## Task 5: Final verification

- [ ] **Step 5.1: Run full test suite**

```bash
cd /Users/peterpitcher/Cursor/OJ-The-Anchor.pub && npm test -- --no-coverage
```

Expected: All tests pass.

- [ ] **Step 5.2: Run lint**

```bash
cd /Users/peterpitcher/Cursor/OJ-The-Anchor.pub && npm run lint
```

Expected: Zero errors, zero warnings.

- [ ] **Step 5.3: Run type check**

```bash
cd /Users/peterpitcher/Cursor/OJ-The-Anchor.pub && npx tsc --noEmit
```

Expected: Clean compilation.

- [ ] **Step 5.4: Run build**

```bash
cd /Users/peterpitcher/Cursor/OJ-The-Anchor.pub && npm run build
```

Expected: Successful production build with no errors.
