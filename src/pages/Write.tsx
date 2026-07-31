import { Link } from "react-router-dom";
import { config } from "../config";
import { t } from "../strings";

// Google Forms renders inside an iframe when `embedded=true` is set, and it
// honors `hl` to force the interface language (and thus text direction). We pin
// Hebrew (`iw` is Google's locale code) so the form stays right-to-left even
// for visitors whose Google account UI language is set to something else
// (e.g. English) — otherwise Google renders it in the signed-in account's
// language and it looks left-to-right.
function withFormParams(url: string, extra: Record<string, string> = {}): string {
  const [base, hash = ""] = url.split("#");
  const sep = base.includes("?") ? "&" : "?";
  const query = new URLSearchParams({ hl: "iw", ...extra }).toString();
  return base + sep + query + (hash ? `#${hash}` : "");
}

export function Write({ variant = "adults" }: { variant?: "adults" | "kids" }) {
  const formUrl = variant === "kids" ? config.kidsFormUrl : config.formUrl;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link
          to="/"
          className="text-sm text-amber-700 hover:underline dark:text-amber-400"
        >
          {t.backHome}
        </Link>
        <a
          href={withFormParams(formUrl)}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-amber-700 hover:underline dark:text-amber-400"
        >
          {t.openFormFullPage}
        </a>
      </div>

      <h1 className="mb-4 text-2xl font-bold text-stone-900 dark:text-stone-50">
        {t.writeReview}
      </h1>

      <iframe
        src={withFormParams(formUrl, { embedded: "true" })}
        title={t.writeReview}
        className="h-[calc(100vh-12rem)] min-h-[600px] w-full rounded-xl border border-amber-200 bg-white dark:border-stone-700"
      >
        {t.formLoading}
      </iframe>
    </div>
  );
}
