# Manager's Special Images

Each month has its own image folder. The website looks for images inside:

`public/images/managers-special/<imageFolder>/`

Where `<imageFolder>` comes from `content/managers-special-promotions.json` (for example `january-2026`).

## Important:
- Prefer a portrait or square image that works well in cards and the hero
- Recommended size: 800px wide or larger
- Supported formats: .jpg, .jpeg, .png, .webp
- Preferred filename: `hero.webp` (or `hero.jpg` as a fallback)

## To Update:
1. Open the correct month folder (for example `public/images/managers-special/january-2026/`)
2. Delete the old `hero.*` image (if present)
3. Drop in the new image as `hero.webp` (or `hero.jpg`)
4. The website will automatically use the new image

The image will appear:
- In the hero banner on the /drinks page
- On the dedicated /drinks/managers-special page
