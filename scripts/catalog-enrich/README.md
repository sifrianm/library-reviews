# Catalog enrichment (Apps Script)

Fills a **new** Google Sheet with catalog data for books that appear in the **reviews** CSVs (adults + kids). It does **not** read the כריכות sheet.

## Sheet headers (row 1)

```
שם ספר | מחבר | מזהה כותר | קישור לקטלוג | קישור לכריכה | תקציר | סוגה | סטטוס עדכון | עדכון אחרון
```

`שם ספר` is the title as it appears in the reviews. `תקציר` comes from **פרטים על הכותר** (`תקציר:`); it stays empty when the catalog has no blurb. `סוגה` is catalog `ז'אנר`.

`סטטוס עדכון`:

- **empty** — try this title again on the next run
- **`OK`** — unique catalog match; do not retry
- **`fail`** — not found, ambiguous, or error; do not retry

To retry a title, clear `סטטוס עדכון` (leave the cell empty). Ambiguous/missing titles get a stub row with `fail` so they are not stuck at the front of the 30-book batch.

## Target spreadsheet (standalone project)

If you created the script at [script.google.com](https://script.google.com) instead of **Extensions → Apps Script** inside the sheet:

1. Open the enrichment spreadsheet. Copy its ID from the URL:

   `https://docs.google.com/spreadsheets/d/`**`THIS_PART`**`/edit`

2. In the script, set:

   `spreadsheetId: "THIS_PART",`

   at the top of `CONFIG` in `CatalogEnrich.gs`. Save.

3. The Google account that owns the script must be **Editor** on that sheet.

4. In the Apps Script editor, choose `menuDryRun` in the function dropdown → **Run**. After a dry run looks good, run `menuRun`.

The sheet menu **העשרת קטלוג** only appears if the script is bound to the spreadsheet. For a standalone project, always run from the editor (or a trigger on `scheduledEnrichment`).

## Install (bound to the sheet)

1. Open the enrichment spreadsheet.
2. **Extensions → Apps Script**.
3. Delete any stub code. Paste the contents of [`CatalogEnrich.gs`](CatalogEnrich.gs).
4. Save. Reload the spreadsheet. You should see the menu **העשרת קטלוג**.
5. First run: **הרצה יבשה (בלי כתיבה)**. Approve the permission prompts (it fetches the published review CSVs and `nmonosson.agronplus.org`).
6. Check the **לוג** tab for failures only (`fail` / `would_fail` / `stopped`). Successful matches are not logged.
7. If that looks right: **הרצה אמיתית** (writes at most 30 **pending** books per run — titles with empty status, or not yet on the sheet).
8. Optional daily trigger: Apps Script **Triggers** → `scheduledEnrichment` → time-driven → once a day.

Paste the **latest** [`CatalogEnrich.gs`](CatalogEnrich.gs) over the project (keep your `spreadsheetId`). Row 1 must include `סטטוס עדכון` as above.

## After it works

Publish this sheet to the web as CSV if you want the reviews site to consume it later. The site currently still uses the old covers sheet (`שם ספר` / `לינק`); wiring `קישור לכריכה` is a separate, later change.
