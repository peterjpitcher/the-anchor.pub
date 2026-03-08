# Food Menu Row Layout Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the large padded card grid layout for menu items with a compact restaurant-style row list — dish name left, price right, description below — to dramatically reduce vertical scroll on mobile.

**Architecture:** All menu item rendering lives in `components/MenuRenderer.tsx`. We replace the two existing components (`MenuItemCard` and `MenuItemList`) and the grid/list rendering branches with a single `MenuItemRow` component. The Manager's Special item (`item.special === true`) retains its existing card treatment as a deliberate exception. Section and category structure (headings, containers) is retained but tightened.

**Tech Stack:** React, TypeScript, Tailwind CSS, `class-variance-authority` (`cn` utility)

---

### Task 1: Replace `MenuItemCard` and `MenuItemList` with `MenuItemRow`

**Files:**
- Modify: `components/MenuRenderer.tsx`

The goal is a single row component that handles all non-special items. The Manager's Special card (`item.special === true`) is left untouched — it already has its own branch and renders as a wide featured card with an image.

**Step 1: Add `MenuItemRow` component**

At the bottom of `components/MenuRenderer.tsx`, before the closing of the file, add this component (above `AllergenInfo`):

```tsx
const MenuItemRow = memo(function MenuItemRow({ item, itemId, isFocused, onFocus }: MenuItemProps) {
  const { displayPrice, schemaPrice, gfAvailable } = normalizePrice(item.price)
  const priceLabel = displayPrice ? `, £${displayPrice}` : ''

  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 py-3 border-b border-anchor-gold/10 last:border-0',
        isFocused && 'bg-anchor-gold/5'
      )}
      itemScope
      itemType="https://schema.org/MenuItem"
      role="listitem"
      data-menu-item
      data-item-id={itemId}
      aria-label={`${item.name}${priceLabel}${item.vegetarian ? ', vegetarian' : ''}`}
      tabIndex={0}
      onFocus={() => onFocus(itemId)}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline flex-wrap gap-x-2 gap-y-0.5">
          <span className="font-semibold text-anchor-cream-text leading-snug" itemProp="name">
            {item.name}
          </span>
          {item.vegetarian && (
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded leading-none">
              V
            </span>
          )}
          {gfAvailable && (
            <span className="text-[11px] font-semibold text-anchor-green/80 bg-anchor-green/10 px-1.5 py-0.5 rounded leading-none">
              GF opt
            </span>
          )}
        </div>
        {item.description && (
          <p className="text-sm text-anchor-cream-text/55 mt-0.5 leading-snug" itemProp="description">
            {item.description}
          </p>
        )}
        <AllergenInfo item={item} />
        {item.vegetarian && (
          <meta itemProp="suitableForDiet" content="https://schema.org/VegetarianDiet" />
        )}
      </div>
      {displayPrice && (
        <span
          className="font-bold text-anchor-gold whitespace-nowrap flex-shrink-0 ml-2 pt-0.5 text-sm"
          itemProp="offers"
          itemScope
          itemType="https://schema.org/Offer"
        >
          <span itemProp="price" content={schemaPrice}>£{displayPrice}</span>
          <meta itemProp="priceCurrency" content="GBP" />
        </span>
      )}
    </div>
  )
})
```

**Step 2: Update the section rendering block in `MenuRenderer`**

Find the block (around line 207–238) that splits on `section.style === 'grid'` and `section.style === 'list'`. Replace both branches with a single unified list:

```tsx
{/* Unified row list — replaces both 'grid' and 'list' style branches */}
<div role="list">
  {section.items.map((item, itemIndex) => {
    const itemId = `${category.id}-${sectionIndex}-${itemIndex}`

    // Manager's Special retains its card treatment
    if (item.special) {
      return (
        <Link key={itemIndex} href="/drinks/managers-special" className="relative md:col-span-2 block group mb-4">
          <HeroBadge text="25% OFF" variant="special" position="absolute" />
          {/* ...existing Manager's Special JSX unchanged... */}
        </Link>
      )
    }

    return (
      <MenuItemRow
        key={itemIndex}
        item={item}
        itemId={itemId}
        isFocused={focusedItem === itemId}
        onFocus={setFocusedItem}
      />
    )
  })}
</div>
```

> **Note:** The Manager's Special block inside this map should be a straight cut-and-paste of the existing `isManagersSpecial` branch from the old `MenuItemCard`, with the outer `<Link>` wrapping intact. Do not rewrite it — just relocate it inline here.

**Step 3: Tighten section sub-headings**

In the existing section header (around line 195–199), change the `h3` from large centred to a compact label that suits a list:

```tsx
{section.title && (
  <h3 className="text-xs font-semibold uppercase tracking-widest text-anchor-gold/60 mb-1 mt-4 first:mt-0">
    {section.title}
  </h3>
)}
{section.description && (
  <p className="text-sm text-anchor-cream-text/55 mb-2">
    {section.description}
  </p>
)}
```

**Step 4: Tighten category section spacing**

The `<section>` for each category currently uses `section-spacing` which is generous. Change it to `py-8` (or `py-6 md:py-10`) directly to reduce vertical padding between categories:

```tsx
<section
  key={category.id}
  id={category.id}
  className={`py-8 ${categoryIndex % 2 === 0 ? 'bg-anchor-bg-raised' : 'bg-anchor-bg'}`}
  itemScope
  itemType="https://schema.org/MenuSection"
>
```

**Step 5: Remove now-unused `MenuItemCard` and `MenuItemList` components**

Delete the `MenuItemCard` and `MenuItemList` `memo` component definitions from the file. Keep `AllergenInfo` — it is used by `MenuItemRow`.

Also clean up any imports that are no longer needed (e.g. `HeroBadge` import can stay if still used for Manager's Special; `Image` can stay for the same reason).

**Step 6: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: zero errors. Fix any that appear before continuing.

**Step 7: Lint**

```bash
npm run lint
```

Expected: zero warnings.

**Step 8: Manual visual check**

Run `npm run dev` and visit `http://localhost:3000/food-menu`. Verify:
- Menu items display as compact rows (name left, price right, description below)
- (V) and GF badges appear inline with item name
- Allergen info shows below description in muted text
- Manager's Special still renders as a featured card
- Kitchen Hours banner still shows above the menu
- Dietary filter bar still works — toggling vegetarian or allergen filters correctly hides rows
- Empty-filter state ("No menu items match...") still shows
- On mobile (DevTools → iPhone), the menu is noticeably shorter to scroll

**Step 9: Commit**

```bash
git add components/MenuRenderer.tsx
git commit -m "feat(food-menu): replace card grid with compact restaurant-style row list

Replaces the large padded card grid (p-8, text-xl) and list-in-card
wrappers with a unified compact row layout: name left, price right,
description below with a thin divider. Roughly halves vertical scroll
on mobile. Manager's Special retains featured card treatment."
```

---

### Task 2: Tighten `AllergenInfo` display

The allergen info currently uses icon + label text which adds vertical height per item. Condense it to a single compact line.

**Files:**
- Modify: `components/MenuRenderer.tsx` — `AllergenInfo` component only

**Step 1: Update `AllergenInfo`**

Replace the existing `AllergenInfo` component with:

```tsx
const AllergenInfo = memo(function AllergenInfo({ item }: { item: MenuItem }) {
  if (!item.allergens || item.allergens.length === 0) return null

  const labels = item.allergens.map(allergen => {
    const info = ALLERGEN_TYPES[allergen as keyof typeof ALLERGEN_TYPES]
    return info ? `${info.icon} ${info.label}` : allergen
  })

  return (
    <p className="text-[11px] text-anchor-cream-text/40 mt-0.5 leading-snug">
      Contains: {labels.join(', ')}
    </p>
  )
})
```

This keeps all allergen information but on a single compact line rather than using `<span>` elements with individual wrappers.

**Step 2: TypeScript + lint check**

```bash
npx tsc --noEmit && npm run lint
```

**Step 3: Commit**

```bash
git add components/MenuRenderer.tsx
git commit -m "refactor(menu): compact allergen info to single line"
```

---

### Task 3: Verify build

**Step 1: Production build**

```bash
npm run build
```

Expected: successful build with no errors. If there are any type or module errors, resolve them — do not suppress.

**Step 2: Final commit if needed**

If any last fixes were required, commit them:

```bash
git add -A
git commit -m "fix(menu): resolve build issues after row layout refactor"
```
