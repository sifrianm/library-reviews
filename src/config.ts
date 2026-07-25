// Central configuration. Edit these values to point the app at your own
// library's Google Sheet / Form and to change wording, without touching the
// component code.

export const config = {
  // Shown in the site header / home screen.
  libraryName: "ספריית נווה-מונוסון",

  // Public "fill the form" URL (Google Form -> Send -> link).
  // Leave empty until you have it; the "write a review" button will be disabled.
  formUrl:
    "https://docs.google.com/forms/d/e/1FAIpQLSc1wm6gADnW0s2TsX0TS8-g3fnK9BKZ0RfGbMmBjOTlqZi1QQ/viewform",

  // Public CSV of the responses sheet via "File -> Share -> Publish to web -> CSV".
  // This endpoint sends `cache-control: max-age=300`, so the browser caches it for
  // ~5 min and repeat loads are instant. New form responses appear within a few
  // minutes (Google's publish refresh interval).
  csvUrl:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTl4L0RFkLX5xrr3X3CXcs5pQUBk4Q2BG-ORm90yt8-czXZlTz3E7flpSUb-Q2vmLzC4uURw2OLRZQ5/pub?gid=437656259&single=true&output=csv",

  // Optional: published CSV (File -> Share -> Publish to web -> CSV) of a
  // separate "covers" sheet that maps a book name to a cover image link.
  // Leave empty to disable covers (every book uses its colored tile).
  coversCsvUrl:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRn2ecMWh1sS8oo80YGQxdw8HryCTHG7CMBXsuchN_48dNV2PltK_IgPvrl3sPSo9ODtwiRdp-6eh65/pub?gid=0&single=true&output=csv",

  // Contact for accessibility issues, shown on the accessibility statement
  // page. Fill in a real address so visitors can report problems.
  accessibilityContactEmail: "",

  // Optional: UserWay accessibility widget account id (free sign-up at
  // userway.org -> add your site -> copy the account id). When set, a floating
  // accessibility toolbar (font size, contrast, link highlight, etc.) loads.
  // Leave empty to disable it.
  accessibilityWidgetAccountId: "",

  // How many book cards to show per "page" before "load more".
  pageSize: 24,
} as const;

// Column headers in the covers sheet. `book` must match the book title as it
// appears in the reviews (matching is whitespace/case-insensitive). `cover`
// holds the image link (a Google Drive share link or any direct image URL).
export const COVERS_HEADER_MAP = {
  book: "שם ספר",
  cover: "לינק",
} as const;

// Maps the sheet's Hebrew column headers to internal field names. If your form
// uses different headers, update the right-hand side to match row 1 exactly.
export const HEADER_MAP = {
  date: "חותמת זמן",
  book: "שם הספר",
  author: "שם הסופר",
  rank: "מה דעתי על הספר",
  review: "כמה מילים על הספר:",
  reader: "שם הקורא/ת",
} as const;

export type RankLevel = {
  value: string; // exact text as it appears in the sheet
  score: number; // higher = better, used for sorting and averaging
  badgeClass: string; // Tailwind classes for the colored badge
};

// Ranks ordered best -> worst. `score` drives "highest/lowest rank" sorting and
// the average-rank badge on each book. Update `value` if your form's options
// differ from the sample data.
export const RANK_LEVELS: RankLevel[] = [
  {
    value: "אחד הספרים הטובים שקראתי",
    score: 4,
    badgeClass:
      "bg-emerald-100 text-emerald-800 ring-emerald-600/20 dark:bg-emerald-900/40 dark:text-emerald-300 dark:ring-emerald-400/20",
  },
  {
    value: "מומלץ מאוד",
    score: 3,
    badgeClass:
      "bg-green-100 text-green-800 ring-green-600/20 dark:bg-green-900/40 dark:text-green-300 dark:ring-green-400/20",
  },
  {
    value: "נחמד",
    score: 2,
    badgeClass:
      "bg-amber-100 text-amber-800 ring-amber-600/20 dark:bg-amber-900/40 dark:text-amber-300 dark:ring-amber-400/20",
  },
  {
    value: "משעמם",
    score: 1,
    badgeClass:
      "bg-rose-100 text-rose-800 ring-rose-600/20 dark:bg-rose-900/40 dark:text-rose-300 dark:ring-rose-400/20",
  },
];

const RANK_BY_VALUE = new Map(RANK_LEVELS.map((r) => [r.value, r]));

export function rankByValue(value: string): RankLevel | undefined {
  return RANK_BY_VALUE.get(value.trim());
}

// Given an average numeric score, return the nearest defined rank level (for
// coloring / labeling a book's average).
export function rankByScore(score: number): RankLevel {
  let best = RANK_LEVELS[0];
  let bestDiff = Infinity;
  for (const level of RANK_LEVELS) {
    const diff = Math.abs(level.score - score);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = level;
    }
  }
  return best;
}
