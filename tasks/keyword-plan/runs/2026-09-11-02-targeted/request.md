# Keyword plan request: the-anchor.pub (GB), run 2026-09-11-02-targeted, mode targeted

## Next required input

Total pulls needed now: 6 (5 Search Console exports; 1 Keyword Planner volume export).

Save everything under `runs/2026-09-11-02-targeted/raw/` using the exact folder and file names below. Do not rename, open and re-save, or edit an export.

## Search Console exports

Property: `sc-domain:the-anchor.pub`. For every export: Performance, Search results; Search type = Web; Country = United Kingdom; the date range named under each export (a preset where one is named, otherwise a custom range with the exact inclusive dates given); keep every tab; Export, Download CSV (this saves a zip of all tabs). Save the zip as `raw/<name>.zip` or its unzipped contents in `raw/<name>/`.

5 of these exports use a Search Console preset date range, so you never type dates for them. Preset ranges move with the day you export, so this run's windows will not line up with an earlier run's. Year-on-year and decay comparisons need identical windows and will report 'not available' for these pulls. The exact window is still read from Chart.csv, so everything measured in this run is exact; only the comparisons with other runs are lost.

### 1. `raw/gsc-3m-p-pg_0001`

Purpose: Complete totals for page pg_0001 (https://www.the-anchor.pub/whats-on) over the Last 3 months preset window, with the named queries that reached it; optional, but without it cannibalisation and unattributed traffic for this page cannot be assessed.

1. Open Performance, Search results for property `sc-domain:the-anchor.pub`.
2. Filters: Search type = Web; Country = United Kingdom; no query filter; add a Page filter, Custom (regex), Matches regex, using exactly this pattern:

```
^https://www[.]the-anchor[.]pub/whats-on$
```

3. Dates: open the date picker and choose the preset **Last 3 months**. Do not set a custom range and do not type any dates.
   Preset ranges drift with the day you export, so year-on-year and decay comparisons will report 'not available' for this pull.
4. Export, Download CSV; save as `raw/gsc-3m-p-pg_0001.zip` or unzip into `raw/gsc-3m-p-pg_0001/`.

### 2. `raw/gsc-3m-p-pg_0002`

Purpose: Complete totals for page pg_0002 (https://www.the-anchor.pub/quiz-night) over the Last 3 months preset window, with the named queries that reached it; optional, but without it cannibalisation and unattributed traffic for this page cannot be assessed.

1. Open Performance, Search results for property `sc-domain:the-anchor.pub`.
2. Filters: Search type = Web; Country = United Kingdom; no query filter; add a Page filter, Custom (regex), Matches regex, using exactly this pattern:

```
^https://www[.]the-anchor[.]pub/quiz-night$
```

3. Dates: open the date picker and choose the preset **Last 3 months**. Do not set a custom range and do not type any dates.
   Preset ranges drift with the day you export, so year-on-year and decay comparisons will report 'not available' for this pull.
4. Export, Download CSV; save as `raw/gsc-3m-p-pg_0002.zip` or unzip into `raw/gsc-3m-p-pg_0002/`.

### 3. `raw/gsc-3m-p-pg_0003`

Purpose: Complete totals for page pg_0003 (https://www.the-anchor.pub/quiz-night/themed) over the Last 3 months preset window, with the named queries that reached it; optional, but without it cannibalisation and unattributed traffic for this page cannot be assessed.

1. Open Performance, Search results for property `sc-domain:the-anchor.pub`.
2. Filters: Search type = Web; Country = United Kingdom; no query filter; add a Page filter, Custom (regex), Matches regex, using exactly this pattern:

```
^https://www[.]the-anchor[.]pub/quiz-night/themed$
```

3. Dates: open the date picker and choose the preset **Last 3 months**. Do not set a custom range and do not type any dates.
   Preset ranges drift with the day you export, so year-on-year and decay comparisons will report 'not available' for this pull.
4. Export, Download CSV; save as `raw/gsc-3m-p-pg_0003.zip` or unzip into `raw/gsc-3m-p-pg_0003/`.

### 4. `raw/gsc-3m-p-pg_0004`

Purpose: Complete totals for page pg_0004 (https://www.the-anchor.pub/music-bingo) over the Last 3 months preset window, with the named queries that reached it; optional, but without it cannibalisation and unattributed traffic for this page cannot be assessed.

1. Open Performance, Search results for property `sc-domain:the-anchor.pub`.
2. Filters: Search type = Web; Country = United Kingdom; no query filter; add a Page filter, Custom (regex), Matches regex, using exactly this pattern:

```
^https://www[.]the-anchor[.]pub/music-bingo$
```

3. Dates: open the date picker and choose the preset **Last 3 months**. Do not set a custom range and do not type any dates.
   Preset ranges drift with the day you export, so year-on-year and decay comparisons will report 'not available' for this pull.
4. Export, Download CSV; save as `raw/gsc-3m-p-pg_0004.zip` or unzip into `raw/gsc-3m-p-pg_0004/`.

### 5. `raw/gsc-3m-p-pg_0005`

Purpose: Complete totals for page pg_0005 (https://www.the-anchor.pub/cash-bingo) over the Last 3 months preset window, with the named queries that reached it; optional, but without it cannibalisation and unattributed traffic for this page cannot be assessed.

1. Open Performance, Search results for property `sc-domain:the-anchor.pub`.
2. Filters: Search type = Web; Country = United Kingdom; no query filter; add a Page filter, Custom (regex), Matches regex, using exactly this pattern:

```
^https://www[.]the-anchor[.]pub/cash-bingo$
```

3. Dates: open the date picker and choose the preset **Last 3 months**. Do not set a custom range and do not type any dates.
   Preset ranges drift with the day you export, so year-on-year and decay comparisons will report 'not available' for this pull.
4. Export, Download CSV; save as `raw/gsc-3m-p-pg_0005.zip` or unzip into `raw/gsc-3m-p-pg_0005/`.

## Keyword Planner settings (apply to every Keyword Planner step)

- Location: United Kingdom
- Language: English
- Network: Google Search
- Date range: last 12 months
- No filters in the tool. Do not apply the avoid list in the tool; the skill applies it after import.
- Download as CSV (not Google Sheets) and keep the file exactly as downloaded.

## Keyword Planner search volumes

Get search volume and forecasts. Upload the file named (or paste its Keyword column), Get started, open the Historical metrics tab, then Download as CSV and save with the file name given. The forecast tab is not used.

1. Upload `paste/volumes-01.csv` (461 keywords); save the download as `raw/gkp-volumes-01.csv`.

## What to send back

- [ ] The Search Console zips or folders listed above, unrenamed, every tab included.
- [ ] Confirmation that every export came from property `sc-domain:the-anchor.pub`.
- [ ] The Keyword Planner CSV files named above.
- [ ] Did the Avg. monthly searches column show ranges (such as 1K to 10K) or plain numbers? Answer once for this run; it sets the volume mode.
- [ ] Confirmation that location, language, network and date range were exactly as printed.
- [ ] Reminder: the avoid list is applied by the skill after import, never in the tool.
- [ ] Anything that could not be exported, with the reason.
