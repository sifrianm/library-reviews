import Papa from "papaparse";
import { config, COVERS_HEADER_MAP, DETAILS_HEADER_MAP, HEADER_MAP, rankByValue } from "./config";
import type { BookGroup, Review } from "./types";

const COVERS_CACHE_KEY = "library-reviews-covers-v1";

type CacheShape = {
  fetchedAt: number;
  csv: string;
};

// A reviews collection: which published CSV to read and where to cache it.
export type ReviewsSource = {
  csvUrl: string;
  cacheKey: string;
};

export const ADULTS_SOURCE: ReviewsSource = {
  csvUrl: config.csvUrl,
  cacheKey: "library-reviews-cache-v2",
};

export const KIDS_SOURCE: ReviewsSource = {
  csvUrl: config.kidsCsvUrl,
  cacheKey: "library-reviews-kids-cache-v1",
};

// Parses "DD/MM/YYYY H:MM:SS" (Google Sheets he-IL export) into a Date.
// Falls back to the native parser for anything unexpected.
export function parseSheetDate(raw: string): Date | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  const m = trimmed.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/,
  );
  if (m) {
    const [, dd, mm, yyyy, hh = "0", min = "0", ss = "0"] = m;
    const d = new Date(
      Number(yyyy),
      Number(mm) - 1,
      Number(dd),
      Number(hh),
      Number(min),
      Number(ss),
    );
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const fallback = new Date(trimmed);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

function rowsFromCsv(csv: string): Review[] {
  const parsed = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: true,
  });

  // The genre column header carries its option list in parentheses, so match it
  // exactly first and otherwise fall back to any header starting with "סוגה".
  const fields = parsed.meta.fields ?? [];
  const genreCol =
    fields.find((h) => h === HEADER_MAP.genre) ??
    fields.find((h) => h.trim().startsWith("סוגה"));

  // Optional external "read the full review" link column. Matched by prefix so
  // minor punctuation/whitespace edits to the long header don't break it. The
  // kids sheet (and old rows) lack this column, so it resolves to "".
  const sourceUrlCol = fields.find((h) => h.trim().startsWith("קישור"));

  const reviews: Review[] = [];
  parsed.data.forEach((row, i) => {
    const book = (row[HEADER_MAP.book] ?? "").trim();
    const author = (row[HEADER_MAP.author] ?? "").trim();
    const rank = (row[HEADER_MAP.rank] ?? "").trim();
    const review = (row[HEADER_MAP.review] ?? "").trim();
    const reader = (row[HEADER_MAP.reader] ?? "").trim();
    const genre = (genreCol ? row[genreCol] : "")?.trim() ?? "";
    const sourceUrl = (sourceUrlCol ? row[sourceUrlCol] : "")?.trim() ?? "";
    const rawDate = (row[HEADER_MAP.date] ?? "").trim();

    // Skip rows with no book title (blank/malformed lines).
    if (!book) return;

    reviews.push({
      id: `${i}`,
      book,
      author,
      rank,
      review,
      reader,
      genre,
      sourceUrl,
      rawDate,
      date: parseSheetDate(rawDate),
    });
  });

  return reviews;
}

export function groupByBook(reviews: Review[]): BookGroup[] {
  const groups = new Map<string, BookGroup>();

  for (const r of reviews) {
    // Group by title alone so the same book collapses even when reviewers spell
    // the author differently (or leave it blank). The displayed author is taken
    // from the first review that provides a non-empty one.
    const key = normalizeTitle(r.book);
    let g = groups.get(key);
    if (!g) {
      g = {
        key,
        book: r.book,
        author: r.author,
        reviews: [],
        count: 0,
        avgScore: 0,
        latest: 0,
        genres: [],
      };
      groups.set(key, g);
    } else if (!g.author && r.author) {
      g.author = r.author;
    }
    g.reviews.push(r);
  }

  for (const g of groups.values()) {
    g.reviews.sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0));
    g.count = g.reviews.length;
    g.latest = g.reviews[0]?.date?.getTime() ?? 0;
    const scores = g.reviews
      .map((r) => rankByValue(r.rank)?.score)
      .filter((s): s is number => typeof s === "number");
    g.avgScore =
      scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    g.genres = [
      ...new Set(g.reviews.map((r) => r.genre).filter((s) => s.length > 0)),
    ];
  }

  return [...groups.values()];
}

export type CatalogDetails = {
  author: string;
  coverUrl: string;
  summary: string;
  genre: string;
  catalogUrl: string;
};

export function applyCatalogDetails(
  groups: BookGroup[],
  details: Map<string, CatalogDetails>,
): BookGroup[] {
  if (details.size === 0) return groups;
  return groups.map((g) => {
    const d = details.get(g.key);
    if (!d) return g;
    return {
      ...g,
      author: d.author || g.author,
      genres: d.genre ? [d.genre] : g.genres,
      summary: d.summary || undefined,
      catalogUrl: d.catalogUrl || undefined,
    };
  });
}

function readCache(cacheKey: string): CacheShape | null {
  try {
    const raw = localStorage.getItem(cacheKey);
    return raw ? (JSON.parse(raw) as CacheShape) : null;
  } catch {
    return null;
  }
}

function writeCache(cacheKey: string, csv: string) {
  try {
    const payload: CacheShape = { fetchedAt: Date.now(), csv };
    localStorage.setItem(cacheKey, JSON.stringify(payload));
  } catch {
    // Storage may be full or unavailable; caching is best-effort.
  }
}

// In-memory copies (keyed by source) so navigating between pages never
// re-parses or re-fetches.
const memReviews = new Map<string, Review[]>();
const inflight = new Map<string, Promise<Review[]>>();

// Duration (ms) of the last successful network fetch per source, for the stats
// page. Measured around the fetch + download (not the localStorage-cached read).
const loadTimes = new Map<string, number>();

// Last measured load time (ms) for a source, or null if it hasn't been fetched
// from the network yet this session.
export function getLoadTimeMs(source: ReviewsSource): number | null {
  return loadTimes.get(source.cacheKey) ?? null;
}

// localStorage key holding the duration (ms) of the very first ("cold") network
// fetch ever recorded for a source. Persisted once and never overwritten.
function coldLoadKey(cacheKey: string): string {
  return `${cacheKey}-coldloadms`;
}

// Reads the persisted cold-start load time (ms) for a source, or null if the
// first fetch has never been recorded.
export function getColdLoadTimeMs(source: ReviewsSource): number | null {
  try {
    const raw = localStorage.getItem(coldLoadKey(source.cacheKey));
    if (raw == null) return null;
    const ms = Number(raw);
    return Number.isFinite(ms) ? ms : null;
  } catch {
    return null;
  }
}

// Persists the first measured fetch duration for a source. Best-effort and
// write-once: subsequent calls never overwrite the original cold value.
function recordColdLoadTime(cacheKey: string, ms: number) {
  try {
    if (localStorage.getItem(coldLoadKey(cacheKey)) == null) {
      localStorage.setItem(coldLoadKey(cacheKey), String(ms));
    }
  } catch {
    // Storage may be full or unavailable; recording is best-effort.
  }
}

// Returns the last-known reviews instantly (memory, then localStorage) without
// any network call, or null if nothing is cached yet. Used for instant paint.
export function getCachedReviews(source: ReviewsSource): Review[] | null {
  const mem = memReviews.get(source.cacheKey);
  if (mem) return mem;
  const cache = readCache(source.cacheKey);
  if (!cache) return null;
  const rows = rowsFromCsv(cache.csv);
  memReviews.set(source.cacheKey, rows);
  return rows;
}

// Fetches fresh data from the source's sheet, updates caches, and returns it.
// Concurrent callers for the same source share one in-flight request.
export function fetchFreshReviews(source: ReviewsSource): Promise<Review[]> {
  if (!source.csvUrl) return Promise.resolve([]);
  const existing = inflight.get(source.cacheKey);
  if (existing) return existing;
  const p = (async () => {
    const start = performance.now();
    try {
      const res = await fetch(source.csvUrl, { redirect: "follow" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const csv = await res.text();
      const elapsed = performance.now() - start;
      loadTimes.set(source.cacheKey, elapsed);
      recordColdLoadTime(source.cacheKey, elapsed);
      writeCache(source.cacheKey, csv);
      const rows = rowsFromCsv(csv);
      memReviews.set(source.cacheKey, rows);
      return rows;
    } finally {
      inflight.delete(source.cacheKey);
    }
  })();
  inflight.set(source.cacheKey, p);
  return p;
}

// Warms the cache in the background (e.g. from the home screen) so the reviews
// page is ready by the time the user navigates to it. Errors are ignored.
export function prefetchReviews(): void {
  if (!memReviews.get(ADULTS_SOURCE.cacheKey)) {
    fetchFreshReviews(ADULTS_SOURCE).catch(() => {
      /* will retry when the reviews page loads */
    });
  }
  fetchFreshCovers().catch(() => {});
  fetchFreshDetails().catch(() => {});
}

// --- Book covers (optional second sheet) -----------------------------------

// Normalizes a book title for matching between the two sheets: trims, collapses
// inner whitespace, and lowercases (harmless for Hebrew, helps mixed text).
export function normalizeTitle(s: string): string {
  return s.trim().replace(/\s+/g, " ").toLowerCase();
}

// Defense-in-depth: only http(s) URLs are safe to feed into src/href sinks.
// Rejects `javascript:`, `data:`, `vbscript:`, `file:`, relative paths, and
// garbage. Never throws (a non-absolute URL makes `new URL` throw).
export function isHttpUrl(str: string): boolean {
  try {
    const { protocol } = new URL(str);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

// Turns a Google Drive share link into an embeddable image URL. Any other value
// is returned only if it is a valid absolute http(s) URL; otherwise "" (no
// cover), which the UI renders as a colored fallback tile.
export function toImageUrl(raw: string): string {
  const url = (raw ?? "").trim();
  if (!url) return "";
  const id =
    url.match(/\/file\/d\/([-\w]{20,})/)?.[1] ??
    url.match(/[?&]id=([-\w]{20,})/)?.[1] ??
    url.match(/\/d\/([-\w]{20,})/)?.[1];
  if (id) return `https://drive.google.com/thumbnail?id=${id}&sz=w600`;
  return isHttpUrl(url) ? url : "";
}

function coversFromCsv(csv: string): Map<string, string> {
  const parsed = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: true,
  });
  const headers = parsed.meta.fields ?? [];

  // Prefer the configured headers; fall back to detecting sensible columns so a
  // slightly different header text still works.
  const bookCol =
    headers.find((h) => h === COVERS_HEADER_MAP.book) ??
    headers.find((h) => h.includes("ספר")) ??
    headers[0];
  const coverCol =
    headers.find((h) => h === COVERS_HEADER_MAP.cover) ??
    headers.find((h) => /קישור|תמונה|כריכה|לינק|link|url|cover/i.test(h));

  const map = new Map<string, string>();
  for (const row of parsed.data) {
    const book = (bookCol ? row[bookCol] : "")?.trim() ?? "";
    let link = (coverCol ? row[coverCol] : "")?.trim() ?? "";
    // Last resort: any cell that looks like a URL.
    if (!link) {
      link = Object.values(row).find((v) => /https?:\/\//.test(v ?? "")) ?? "";
    }
    if (!book || !link) continue;
    map.set(normalizeTitle(book), toImageUrl(link));
  }
  return map;
}

let memCovers: Map<string, string> | null = null;
let coversInflight: Promise<Map<string, string>> | null = null;

// Instant cover map from memory/localStorage (empty if none cached yet).
export function getCachedCovers(): Map<string, string> {
  if (memCovers) return memCovers;
  try {
    const raw = localStorage.getItem(COVERS_CACHE_KEY);
    if (raw) {
      memCovers = coversFromCsv((JSON.parse(raw) as CacheShape).csv);
      return memCovers;
    }
  } catch {
    /* ignore */
  }
  return new Map();
}

// Fetches the covers sheet (if configured) and updates caches. Resolves to an
// empty map when covers are disabled or the fetch fails.
export function fetchFreshCovers(): Promise<Map<string, string>> {
  if (!config.coversCsvUrl) return Promise.resolve(new Map());
  if (coversInflight) return coversInflight;
  coversInflight = (async () => {
    try {
      const res = await fetch(config.coversCsvUrl, { redirect: "follow" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const csv = await res.text();
      try {
        const payload: CacheShape = { fetchedAt: Date.now(), csv };
        localStorage.setItem(COVERS_CACHE_KEY, JSON.stringify(payload));
      } catch {
        /* best-effort */
      }
      memCovers = coversFromCsv(csv);
      return memCovers;
    } finally {
      coversInflight = null;
    }
  })();
  return coversInflight;
}

// Looks up a book's cover image URL from the covers map (or undefined).
export function coverForBook(
  covers: Map<string, string>,
  book: string,
  details?: Map<string, CatalogDetails>,
): string | undefined {
  const key = normalizeTitle(book);
  const fromDetails = details?.get(key)?.coverUrl;
  if (fromDetails) return fromDetails;
  return covers.get(key);
}

const DETAILS_CACHE_KEY = "library-reviews-catalog-details-v1";

function col_(headers: string[], exact: string, fallback: (h: string) => boolean) {
  return headers.find((h) => h === exact) ?? headers.find(fallback);
}

function detailsFromCsv(csv: string): Map<string, CatalogDetails> {
  const parsed = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: true,
  });
  const headers = parsed.meta.fields ?? [];
  const bookCol = col_(headers, DETAILS_HEADER_MAP.book, (h) => h.includes("ספר"));
  const authorCol = col_(headers, DETAILS_HEADER_MAP.author, (h) => h === "מחבר");
  const coverCol = col_(headers, DETAILS_HEADER_MAP.cover, (h) =>
    h.includes("כריכה"),
  );
  const summaryCol = col_(headers, DETAILS_HEADER_MAP.summary, (h) =>
    h.includes("תקציר"),
  );
  const genreCol = col_(headers, DETAILS_HEADER_MAP.genre, (h) =>
    h.trim().startsWith("סוגה"),
  );
  const catalogUrlCol = col_(headers, DETAILS_HEADER_MAP.catalogUrl, (h) =>
    h.includes("קטלוג"),
  );
  const statusCol = col_(headers, DETAILS_HEADER_MAP.status, (h) =>
    h.includes("סטטוס"),
  );

  const map = new Map<string, CatalogDetails>();
  for (const row of parsed.data) {
    const status = (statusCol ? row[statusCol] : "")?.trim() ?? "";
    if (status && status !== "OK") continue;
    const book = (bookCol ? row[bookCol] : "")?.trim() ?? "";
    if (!book) continue;
    const catalogUrlRaw = (catalogUrlCol ? row[catalogUrlCol] : "")?.trim() ?? "";
    map.set(normalizeTitle(book), {
      author: (authorCol ? row[authorCol] : "")?.trim() ?? "",
      coverUrl: toImageUrl((coverCol ? row[coverCol] : "")?.trim() ?? ""),
      summary: (summaryCol ? row[summaryCol] : "")?.trim() ?? "",
      genre: (genreCol ? row[genreCol] : "")?.trim() ?? "",
      catalogUrl: isHttpUrl(catalogUrlRaw) ? catalogUrlRaw : "",
    });
  }
  return map;
}

let memDetails: Map<string, CatalogDetails> | null = null;
let detailsInflight: Promise<Map<string, CatalogDetails>> | null = null;

export function getCachedDetails(): Map<string, CatalogDetails> {
  if (memDetails) return memDetails;
  try {
    const raw = localStorage.getItem(DETAILS_CACHE_KEY);
    if (raw) {
      memDetails = detailsFromCsv((JSON.parse(raw) as CacheShape).csv);
      return memDetails;
    }
  } catch {
    /* ignore */
  }
  return new Map();
}

export function fetchFreshDetails(): Promise<Map<string, CatalogDetails>> {
  if (!config.detailsCsvUrl) return Promise.resolve(new Map());
  if (detailsInflight) return detailsInflight;
  detailsInflight = (async () => {
    try {
      const res = await fetch(config.detailsCsvUrl, { redirect: "follow" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const csv = await res.text();
      try {
        localStorage.setItem(
          DETAILS_CACHE_KEY,
          JSON.stringify({ fetchedAt: Date.now(), csv } satisfies CacheShape),
        );
      } catch {
        /* best-effort */
      }
      memDetails = detailsFromCsv(csv);
      return memDetails;
    } finally {
      detailsInflight = null;
    }
  })();
  return detailsInflight;
}
