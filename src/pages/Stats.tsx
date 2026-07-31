import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { GenreBadge } from "../components/GenreBadge";
import { RankBadge } from "../components/RankBadge";
import { RANK_LEVELS } from "../config";
import {
  ADULTS_SOURCE,
  KIDS_SOURCE,
  fetchFreshReviews,
  getCachedReviews,
  groupByBook,
} from "../data";
import { t } from "../strings";
import type { BookGroup, Review } from "../types";

const collator = new Intl.Collator("he");
const monthFmt = new Intl.DateTimeFormat("he-IL", {
  year: "numeric",
  month: "long",
});

const CARD =
  "rounded-2xl border border-amber-200 bg-[#fffdf8] p-4 shadow-sm dark:border-stone-700 dark:bg-stone-800 sm:p-5";

export function Stats() {
  const [adults, setAdults] = useState<Review[]>([]);
  const [kids, setKids] = useState<Review[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  useEffect(() => {
    const a = getCachedReviews(ADULTS_SOURCE);
    const k = getCachedReviews(KIDS_SOURCE);
    if (a) setAdults(a);
    if (k) setKids(k);
    if (a || k) setStatus("ready");

    Promise.allSettled([
      fetchFreshReviews(ADULTS_SOURCE).then(setAdults),
      fetchFreshReviews(KIDS_SOURCE).then(setKids),
    ]).then((res) => {
      if (res.some((r) => r.status === "fulfilled")) setStatus("ready");
      else if (!a && !k) setStatus("error");
    });
  }, []);

  const stats = useMemo(() => computeStats(adults, kids), [adults, kids]);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">
          {t.statsPage}
        </h1>
        <Link
          to="/"
          className="text-sm text-amber-700 hover:underline dark:text-amber-400"
        >
          {t.backHome}
        </Link>
      </div>

      {status === "loading" && (
        <p className="py-16 text-center text-stone-500 dark:text-stone-400">
          {t.loading}
        </p>
      )}

      {status === "error" && (
        <p className="py-16 text-center text-stone-700 dark:text-stone-300">
          {t.errorTitle}
        </p>
      )}

      {status === "ready" && stats.totalReviews === 0 && (
        <p className="py-16 text-center text-stone-500 dark:text-stone-400">
          {t.statsEmpty}
        </p>
      )}

      {status === "ready" && stats.totalReviews > 0 && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              value={stats.totalBooks}
              label={t.statsBooks}
              sub={t.statsAdultsKidsSplit(stats.adultsBooks, stats.kidsBooks)}
            />
            <StatCard
              value={stats.totalReviews}
              label={t.statsReviews}
              sub={t.statsAdultsKidsSplit(
                stats.adultsReviews,
                stats.kidsReviews,
              )}
            />
            <StatCard value={stats.readerCount} label={t.statsReaders} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <section className={CARD}>
              <SectionTitle>{t.statsByRank}</SectionTitle>
              <div className="space-y-3">
                {stats.rankRows.map((r) => (
                  <DistroBar
                    key={r.value}
                    label={<RankBadge value={r.value} />}
                    count={r.count}
                    max={stats.rankMax}
                  />
                ))}
              </div>
            </section>

            {stats.genreRows.length > 0 && (
              <section className={CARD}>
                <SectionTitle>{t.statsByGenre}</SectionTitle>
                <div className="space-y-3">
                  {stats.genreRows.map((g) => (
                    <DistroBar
                      key={g.value}
                      label={<GenreBadge value={g.value} />}
                      count={g.count}
                      max={stats.genreMax}
                    />
                  ))}
                </div>
              </section>
            )}

            <section className={CARD}>
              <SectionTitle>{t.statsMostReviewed}</SectionTitle>
              <ol className="space-y-2">
                {stats.mostReviewed.map((g, i) => (
                  <li
                    key={g.key}
                    className="flex items-center gap-2 border-b border-amber-100 pb-2 last:border-0 last:pb-0 dark:border-stone-700"
                  >
                    <span className="w-5 flex-none text-sm font-bold text-stone-400 dark:text-stone-500">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div
                        className="truncate text-sm font-semibold text-stone-800 dark:text-stone-100"
                        dir="auto"
                      >
                        {g.book}
                      </div>
                      {g.author && (
                        <div
                          className="truncate text-xs text-stone-500 dark:text-stone-400"
                          dir="auto"
                        >
                          {t.by} {g.author}
                        </div>
                      )}
                    </div>
                    <span className="flex-none text-xs text-stone-500 dark:text-stone-400">
                      {t.reviewsCount(g.count)}
                    </span>
                  </li>
                ))}
              </ol>
            </section>

            <section className={CARD}>
              <SectionTitle>{t.statsActiveReaders}</SectionTitle>
              <ol className="space-y-2">
                {stats.topReaders.map((r, i) => (
                  <li
                    key={r.name}
                    className="flex items-center gap-2 border-b border-amber-100 pb-2 last:border-0 last:pb-0 dark:border-stone-700"
                  >
                    <span className="w-5 flex-none text-sm font-bold text-stone-400 dark:text-stone-500">
                      {i + 1}
                    </span>
                    <span
                      className="min-w-0 flex-1 truncate text-sm font-medium text-stone-800 dark:text-stone-100"
                      dir="auto"
                    >
                      {r.name}
                    </span>
                    <span className="flex-none text-xs text-stone-500 dark:text-stone-400">
                      {t.reviewsCount(r.count)}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          {stats.monthRows.length > 0 && (
            <section className={CARD}>
              <SectionTitle>{t.statsByMonth}</SectionTitle>
              <div className="space-y-3">
                {stats.monthRows.map((m) => (
                  <DistroBar
                    key={m.key}
                    label={m.label}
                    count={m.count}
                    max={stats.monthMax}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-3 text-lg font-bold text-stone-800 dark:text-stone-100">
      {children}
    </h2>
  );
}

function StatCard({
  value,
  label,
  sub,
}: {
  value: number;
  label: string;
  sub?: string;
}) {
  return (
    <div className={`${CARD} text-center`}>
      <div className="text-3xl font-extrabold text-stone-900 dark:text-stone-50">
        {value}
      </div>
      <div className="mt-1 text-sm text-stone-600 dark:text-stone-300">
        {label}
      </div>
      {sub && (
        <div className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">
          {sub}
        </div>
      )}
    </div>
  );
}

function DistroBar({
  label,
  count,
  max,
}: {
  label: ReactNode;
  count: number;
  max: number;
}) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="min-w-0 text-sm text-stone-700 dark:text-stone-300">
          {label}
        </span>
        <span className="flex-none text-sm font-medium text-stone-500 dark:text-stone-400">
          {count}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-stone-200/70 dark:bg-stone-700/60">
        <div
          className="h-full rounded-full bg-amber-500/80 dark:bg-amber-500/70"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

type MonthRow = { key: string; label: string; count: number };

function computeStats(adults: Review[], kids: Review[]) {
  const all = [...adults, ...kids];
  const adultsGroups = groupByBook(adults);
  const kidsGroups = groupByBook(kids);

  // Rank distribution (best -> worst), plus an "unranked" bucket if any.
  const rankCounts = new Map<string, number>();
  for (const r of all) {
    if (r.rank) rankCounts.set(r.rank, (rankCounts.get(r.rank) ?? 0) + 1);
  }
  const rankRows = RANK_LEVELS.map((l) => ({
    value: l.value,
    count: rankCounts.get(l.value) ?? 0,
  })).filter((row) => row.count > 0);
  const rankMax = Math.max(1, ...rankRows.map((r) => r.count));

  // Genre distribution (adults only — kids reviews carry no genre).
  const genreCounts = new Map<string, number>();
  for (const r of adults) {
    if (r.genre) genreCounts.set(r.genre, (genreCounts.get(r.genre) ?? 0) + 1);
  }
  const genreRows = [...genreCounts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || collator.compare(a.value, b.value));
  const genreMax = Math.max(1, ...genreRows.map((g) => g.count));

  // Most-reviewed books across both collections.
  const mostReviewed = [...adultsGroups, ...kidsGroups]
    .filter((g) => g.count > 0)
    .sort((a, b) => b.count - a.count || collator.compare(a.book, b.book))
    .slice(0, 5) as BookGroup[];

  // Most active readers across both collections.
  const readerCounts = new Map<string, number>();
  for (const r of all) {
    const name = r.reader.trim();
    if (name) readerCounts.set(name, (readerCounts.get(name) ?? 0) + 1);
  }
  const topReaders = [...readerCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || collator.compare(a.name, b.name))
    .slice(0, 5);

  // Reviews per month (chronological).
  const monthCounts = new Map<string, number>();
  for (const r of all) {
    if (!r.date) continue;
    const key = `${r.date.getFullYear()}-${String(r.date.getMonth() + 1).padStart(2, "0")}`;
    monthCounts.set(key, (monthCounts.get(key) ?? 0) + 1);
  }
  const monthRows: MonthRow[] = [...monthCounts.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, count]) => {
      const [y, m] = key.split("-").map(Number);
      return { key, label: monthFmt.format(new Date(y, m - 1, 1)), count };
    });
  const monthMax = Math.max(1, ...monthRows.map((m) => m.count));

  return {
    totalReviews: all.length,
    totalBooks: adultsGroups.length + kidsGroups.length,
    adultsReviews: adults.length,
    kidsReviews: kids.length,
    adultsBooks: adultsGroups.length,
    kidsBooks: kidsGroups.length,
    readerCount: readerCounts.size,
    rankRows,
    rankMax,
    genreRows,
    genreMax,
    mostReviewed,
    topReaders,
    monthRows,
    monthMax,
  };
}
