# Self-hosted fonts

The site's three typefaces are served from the files in this folder. `index.ts`
declares them with `next/font/local`, and `app/globals.css` joins them into
`--font-display`, `--font-body` and `--font-script`.

They used to be downloaded from Google Fonts by `next/font/google` during every
build. On 6 October 2026 Google answered two builds with font links that have no
file extension, which the Next.js loader cannot read
([vercel/next.js#99114](https://github.com/vercel/next.js/issues/99114)), and
both builds failed. With the files in the repository a build makes no network
call for fonts.

## Where each file came from

Fetched on 6 October 2026 from the addresses below. They are the addresses
Google's stylesheet gave for the same three requests `next/font/google` made,
and each file was checked, byte for byte, against the one the live site was
serving that day. Nothing has been edited, subset or converted.

| File | Family and version | Subset | Source | SHA-256 |
| --- | --- | --- | --- | --- |
| `dm-serif-display-latin-400-normal.woff2` | DM Serif Display v17, regular | latin | `https://fonts.gstatic.com/s/dmserifdisplay/v17/-nFnOHM81r4j6k0gjAW3mujVU2B2G_Bx0vrx52g.woff2` | `f273cf2c9ce9bc7d6b0f4fcb8aee72f8cf5a249991308b6a144217e0760c5d3f` |
| `dm-serif-display-latin-400-italic.woff2` | DM Serif Display v17, italic | latin | `https://fonts.gstatic.com/s/dmserifdisplay/v17/-nFhOHM81r4j6k0gjAW3mujVU2B2G_VB0PD2xWr53A.woff2` | `94b0e8fc568c1361f31de02a91297adf78a5a926f4a86932f22643e504cd012f` |
| `dm-serif-display-latin-ext-400-normal.woff2` | DM Serif Display v17, regular | latin-ext | `https://fonts.gstatic.com/s/dmserifdisplay/v17/-nFnOHM81r4j6k0gjAW3mujVU2B2G_5x0vrx52jJ3Q.woff2` | `dfea1d6549e78df6e55d942c1d1eba5e2f809496205bc0b3a9d684f268b60011` |
| `dm-serif-display-latin-ext-400-italic.woff2` | DM Serif Display v17, italic | latin-ext | `https://fonts.gstatic.com/s/dmserifdisplay/v17/-nFhOHM81r4j6k0gjAW3mujVU2B2G_VB3vD2xWr53BJl.woff2` | `432390010167ff2a4377385f17789727e52fbfcfd8d4b810bbfaf5f60e032e7f` |
| `outfit-latin-variable.woff2` | Outfit v15, variable weight | latin | `https://fonts.gstatic.com/s/outfit/v15/QGYvz_MVcBeNP4NJtEtqUYLknw.woff2` | `92684e4acde79ef07758cd09380b7e01e9824d8b061eddeda046f78c166d7b12` |
| `outfit-latin-ext-variable.woff2` | Outfit v15, variable weight | latin-ext | `https://fonts.gstatic.com/s/outfit/v15/QGYvz_MVcBeNP4NJuktqUYLkn8BJ.woff2` | `9e38b3f1575daba3435ef09d33a202585ed5bd204bd0a8c744955c750c2b9091` |
| `clicker-script-latin-400-normal.woff2` | Clicker Script v14, regular | latin | `https://fonts.gstatic.com/s/clickerscript/v14/raxkHiKPvt8CMH6ZWP8PdlEq71rf0Tu2Krfu.woff2` | `a4ad9ff4d187006b631c221fc165334394305d45cc964e8080a4743e69e98c82` |
| `clicker-script-latin-ext-400-normal.woff2` | Clicker Script v14, regular | latin-ext | `https://fonts.gstatic.com/s/clickerscript/v14/raxkHiKPvt8CMH6ZWP8PdlEq71rR0Tu2KrfuYFE.woff2` | `1e87d3e4dd4fd99438bcf00ed8904c81a1e1a82b49e5188ea4c308f3d3e0a912` |

The stylesheets those addresses were read from:

- `https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital,wght@0,400;1,400&display=swap`
- `https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap`
- `https://fonts.googleapis.com/css2?family=Clicker+Script:wght@400&display=swap`

To check the files have not changed, run `shasum -a 256 app/fonts/*.woff2` and
compare with the table.

## Licence

All three families are published under the SIL Open Font License, version 1.1,
which allows the fonts to be bundled and redistributed provided the copyright
notice and the licence travel with them. The licence text for each family is
kept beside the files, copied unchanged from the
[google/fonts](https://github.com/google/fonts) repository:

| Family | Licence file here | Copied from |
| --- | --- | --- |
| DM Serif Display | `OFL-dm-serif-display.txt` | `ofl/dmserifdisplay/OFL.txt` |
| Outfit | `OFL-outfit.txt` | `ofl/outfit/OFL.txt` |
| Clicker Script | `OFL-clicker-script.txt` | `ofl/clickerscript/OFL.txt` |

The files are unmodified copies and keep their original names, so the licence's
conditions on modified versions and reserved font names do not come into play.

## Changing a font

Google no longer updates these copies for us. To take a newer version, or to add
a weight or a family, download the new files, replace them here, update the
table above and the declarations in `index.ts`, and keep the licence file with
them. If a family changes, the fallback numbers in `app/globals.css` need
recalculating too.

Do not go back to `next/font/google`. ESLint blocks the import for the reason
given at the top of this page.
