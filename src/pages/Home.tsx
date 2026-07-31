import { useEffect } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.jpg";
import { config } from "../config";
import { prefetchReviews } from "../data";
import { t } from "../strings";

const CARD =
  "group flex flex-col p-6 rounded-2xl border border-amber-200 bg-[#fffdf8] shadow-sm transition hover:border-amber-400 hover:shadow-md dark:border-stone-700 dark:bg-stone-800 dark:hover:border-amber-500";

export function Home() {
  // Warm the reviews cache while the user reads the home screen, so the
  // reviews page is ready (or near-ready) by the time they click through.
  useEffect(() => {
    prefetchReviews();
  }, []);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 text-center">
        <img
          src={logo}
          alt={config.libraryName}
          className="mx-auto mb-4 h-28 w-28 rounded-full bg-[#fafbbb] object-contain p-2.5 shadow-sm ring-1 ring-amber-200 dark:ring-stone-700 sm:h-32 sm:w-32"
        />
        <h1 className="text-3xl font-extrabold text-stone-900 dark:text-stone-50 sm:text-4xl">
          {config.libraryName}
        </h1>
        <p className="mt-3 text-stone-600 dark:text-stone-300">{t.tagline}</p>
      </div>

      <div className="space-y-6">
        <Section title={t.adultsSection}>
          <FormCard formUrl={config.formUrl} to="/write" emoji="✍️" />
          <Tile
            to="/reviews"
            emoji="🔎"
            title={t.browseReviews}
            sub={t.browseReviewsSub}
          />
        </Section>

        <Section title={t.childrenSection}>
          <FormCard formUrl={config.kidsFormUrl} to="/kids-write" emoji="🖍️" />
          <Tile
            to="/kids-reviews"
            emoji="🧸"
            title={t.browseReviews}
            sub={t.browseReviewsSub}
          />
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-amber-200/80 bg-[#f6f1e7]/60 p-4 dark:border-stone-700 dark:bg-stone-900/40 sm:p-5">
      <div className="mb-3 flex items-center gap-2 px-1">
        <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100">
          {title}
        </h2>
        {badge && (
          <span className="rounded-full bg-amber-200/80 px-2 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-900/50 dark:text-amber-200">
            {badge}
          </span>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Tile({
  to,
  emoji,
  title,
  sub,
  disabled,
}: {
  to?: string;
  emoji: string;
  title: string;
  sub: string;
  disabled?: boolean;
}) {
  const body = (
    <>
      <span className="text-3xl">{emoji}</span>
      <span className="mt-3 text-xl font-bold">{title}</span>
      <span className="mt-1 text-sm text-stone-500 dark:text-stone-400">
        {sub}
      </span>
    </>
  );

  if (disabled || !to) {
    return (
      <div className={`${CARD} cursor-not-allowed opacity-60`} aria-disabled>
        {body}
      </div>
    );
  }

  return (
    <Link to={to} className={CARD}>
      {body}
    </Link>
  );
}

function FormCard({
  formUrl,
  to,
  emoji,
}: {
  formUrl: string;
  to: string;
  emoji: string;
}) {
  if (!formUrl) {
    return (
      <Tile
        emoji={emoji}
        title={t.writeReview}
        sub={t.formUnavailable}
        disabled
      />
    );
  }

  return (
    <Tile to={to} emoji={emoji} title={t.writeReview} sub={t.writeReviewSub} />
  );
}
