import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookCard } from "../components/BookCard";
import { config } from "../config";
import {
  ADULTS_SOURCE,
  KIDS_SOURCE,
  coverForBook,
  fetchFreshCovers,
  fetchFreshReviews,
  getCachedCovers,
  getCachedReviews,
  groupByBook,
} from "../data";
import { t } from "../strings";
import type { BookGroup, Review } from "../types";

type Scope = "all" | "book" | "author" | "reader";
type Sort =
  | "newest"
  | "bookAsc"
  | "authorAsc"
  | "rankDesc"
  | "rankAsc"
  | "mostReviewed"
  | "genreAsc";

const collator = new Intl.Collator("he");

// text-base on mobile (16px) prevents iOS Safari auto-zoom on focus; text-sm on
// larger screens.
const FIELD =
  "rounded-lg border px-2 py-2 text-base sm:text-sm shadow-sm outline-none border-amber-300 bg-white text-stone-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 dark:focus:border-amber-500 dark:focus:ring-amber-900/40";

const PRIMARY_BTN =
  "rounded-lg px-5 py-2 text-sm font-medium bg-amber-700 text-white hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500";

export function Reviews({ variant = "adults" }: { variant?: "adults" | "kids" }) {
  const source = variant === "kids" ? KIDS_SOURCE : ADULTS_SOURCE;
  const heading = variant === "kids" ? t.browseReviewsKids : t.browseReviews;

  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [reviews, setReviews] = useState<Review[]>([]);
  const [covers, setCovers] = useState<Map<string, string>>(() =>
    getCachedCovers(),
  );
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<Scope>("all");
  const [genre, setGenre] = useState<string>("all");
  const [sort, setSort] = useState<Sort>("newest");
  const [visible, setVisible] = useState<number>(config.pageSize);

  function load() {
    // Paint instantly from any cached copy, then refresh in the background.
    const cached = getCachedReviews(source);
    if (cached) {
      setReviews(cached);
      setStatus("ready");
    } else {
      setReviews([]);
      setStatus("loading");
    }

    fetchFreshReviews(source)
      .then((fresh) => {
        setReviews(fresh);
        setStatus("ready");
      })
      .catch(() => {
        if (!cached) setStatus("error");
      });

    fetchFreshCovers()
      .then((fresh) => {
        if (fresh.size > 0) setCovers(fresh);
      })
      .catch(() => {
        /* covers are optional */
      });
  }

  // Reload whenever the source changes (e.g. navigating adults <-> kids).
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

  const allGroups = useMemo(() => groupByBook(reviews), [reviews]);

  const allGenres = useMemo(() => {
    const set = new Set<string>();
    for (const r of reviews) if (r.genre) set.add(r.genre);
    return [...set].sort((a, b) => collator.compare(a, b));
  }, [reviews]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result: BookGroup[] = allGroups;

    if (q) {
      result = result.filter((g) => {
        const inBook = g.book.toLowerCase().includes(q);
        const inAuthor = g.author.toLowerCase().includes(q);
        const inReader = g.reviews.some((r) =>
          r.reader.toLowerCase().includes(q),
        );
        switch (scope) {
          case "book":
            return inBook;
          case "author":
            return inAuthor;
          case "reader":
            return inReader;
          default:
            return inBook || inAuthor || inReader;
        }
      });
    }

    if (genre !== "all") {
      result = result.filter((g) => g.genres.includes(genre));
    }

    const sorted = [...result];
    sorted.sort((a, b) => {
      switch (sort) {
        case "bookAsc":
          return collator.compare(a.book, b.book);
        case "authorAsc":
          return collator.compare(a.author, b.author);
        case "rankDesc": {
          const byRank = b.avgScore - a.avgScore;
          return byRank !== 0 ? byRank : b.latest - a.latest;
        }
        case "rankAsc":
          return a.avgScore - b.avgScore;
        case "mostReviewed":
          return b.count - a.count;
        case "genreAsc": {
          // Books can carry several genres; compare by their first genre
          // alphabetically, and push books without a genre to the end.
          const ga = a.genres.length ? [...a.genres].sort(collator.compare)[0] : "";
          const gb = b.genres.length ? [...b.genres].sort(collator.compare)[0] : "";
          if (!ga && !gb) return b.latest - a.latest;
          if (!ga) return 1;
          if (!gb) return -1;
          const byGenre = collator.compare(ga, gb);
          return byGenre !== 0 ? byGenre : b.latest - a.latest;
        }
        case "newest":
        default:
          return b.latest - a.latest;
      }
    });
    return sorted;
  }, [allGroups, query, scope, genre, sort]);

  useEffect(() => {
    setVisible(config.pageSize);
  }, [query, scope, genre, sort]);

  // Fall back to the default sort if the current data has no genres (e.g. kids).
  useEffect(() => {
    if (sort === "genreAsc" && allGenres.length === 0) setSort("newest");
  }, [sort, allGenres]);

  const totalReviews = useMemo(
    () => filtered.reduce((sum, g) => sum + g.count, 0),
    [filtered],
  );

  const shown = filtered.slice(0, visible);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">
          {heading}
        </h1>
        <Link
          to="/"
          className="text-sm text-amber-700 hover:underline dark:text-amber-400"
        >
          {t.backHome}
        </Link>
      </div>

      <div className="sticky top-0 z-10 -mx-4 mb-4 border-b border-amber-200/70 bg-[#f6f1e7] px-4 py-3 dark:border-stone-700 dark:bg-stone-900">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-2">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              aria-label={t.searchPlaceholder}
              className={`w-full ${FIELD}`}
              dir="auto"
            />
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as Scope)}
              aria-label={t.searchScopeLabel}
              className={FIELD}
            >
              <option value="all">{t.searchScopeAll}</option>
              <option value="book">{t.searchScopeBook}</option>
              <option value="author">{t.searchScopeAuthor}</option>
              <option value="reader">{t.searchScopeReader}</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            {allGenres.length > 0 && (
              <span className="flex items-center gap-2">
                <label className="text-sm text-stone-500 dark:text-stone-400">
                  {t.genreLabel}
                </label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  aria-label={t.genreLabel}
                  className={FIELD}
                >
                  <option value="all">{t.genreAll}</option>
                  {allGenres.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </span>
            )}

            <span className="flex items-center gap-2">
              <label className="text-sm text-stone-500 dark:text-stone-400">
                {t.sortLabel}
              </label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                aria-label={t.sortLabel}
                className={FIELD}
              >
                <option value="newest">{t.sortNewest}</option>
                <option value="bookAsc">{t.sortBookAsc}</option>
                <option value="authorAsc">{t.sortAuthorAsc}</option>
                <option value="rankDesc">{t.sortRankDesc}</option>
                <option value="rankAsc">{t.sortRankAsc}</option>
                <option value="mostReviewed">{t.sortMostReviewed}</option>
                {allGenres.length > 0 && (
                  <option value="genreAsc">{t.sortGenreAsc}</option>
                )}
              </select>
            </span>
          </div>
        </div>

        {status === "ready" && (
          <div className="mt-2 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span>{t.resultsCount(filtered.length, totalReviews)}</span>
            {(query || genre !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setScope("all");
                  setGenre("all");
                }}
                className="text-amber-700 hover:underline dark:text-amber-400"
              >
                {t.clearFilters}
              </button>
            )}
          </div>
        )}
      </div>

      {status === "loading" && (
        <p className="py-16 text-center text-stone-500 dark:text-stone-400">
          {t.loading}
        </p>
      )}

      {status === "error" && (
        <div className="py-16 text-center">
          <p className="text-stone-700 dark:text-stone-300">{t.errorTitle}</p>
          <button type="button" onClick={load} className={`mt-3 ${PRIMARY_BTN}`}>
            {t.retry}
          </button>
        </div>
      )}

      {status === "ready" && filtered.length === 0 && (
        <p className="py-16 text-center text-stone-500 dark:text-stone-400">
          {t.emptyState}
        </p>
      )}

      {status === "ready" && filtered.length > 0 && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {shown.map((g) => (
              <BookCard
                key={g.key}
                group={g}
                coverUrl={coverForBook(covers, g.book)}
              />
            ))}
          </div>

          {visible < filtered.length && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setVisible((v) => v + config.pageSize)}
                className={PRIMARY_BTN}
              >
                {t.loadMore}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
