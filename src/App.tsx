import { useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import bookshelfBg from "./assets/bookshelf-bg.jpg";
import kidsBg from "./assets/kids-bg.jpg";
import logo from "./assets/logo.jpg";
import { config } from "./config";
import { t } from "./strings";
import { ModeSwitch } from "./theme";

export default function App() {
  // Kids sections (/kids-reviews, /kids-write) get a playful, dreamy backdrop;
  // everything else keeps the bookshelf.
  const location = useLocation();
  const isKids = location.pathname.startsWith("/kids");
  const backgroundImage = isKids ? kidsBg : bookshelfBg;
  const overlayClass = isKids
    ? "bg-[#fbf7ff]/[0.72] dark:bg-[#181425]/[0.88]"
    : "bg-[#f6f1e7]/[0.78] dark:bg-[#1a1613]/[0.90]";

  // Load the self-hosted Legilo accessibility reading-aid toolbar
  // (public/legilo.js). Config is passed via data-* attributes read by the
  // widget from its own script tag.
  useEffect(() => {
    if (
      !config.accessibilityWidget ||
      document.getElementById("legilo-widget-script")
    )
      return;
    const s = document.createElement("script");
    s.id = "legilo-widget-script";
    s.src = `${import.meta.env.BASE_URL}legilo.js`;
    s.defer = true;
    s.setAttribute("data-lang", "he");
    s.setAttribute("data-color", "b45309");
    s.setAttribute("data-pos", "bl");
    s.setAttribute("data-hotkey", "1");
    // Link our Hebrew accessibility statement in the widget's panel footer.
    s.setAttribute(
      "data-statement",
      `${window.location.origin}${window.location.pathname}#/accessibility`,
    );
    document.body.appendChild(s);
  }, []);

  return (
    <div className="flex min-h-full flex-col font-sans text-stone-800 dark:text-stone-100">
      <a
        href="#main-content"
        className="skip-link rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white shadow-lg dark:bg-amber-600"
      >
        {t.skipToContent}
      </a>

      {/* colorful backdrop (bookshelf, or a kids theme), muted behind an overlay */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
        <div className={`absolute inset-0 ${overlayClass}`} />
      </div>

      <header className="border-b border-amber-200/70 bg-[#f6f1e7] dark:border-stone-700 dark:bg-stone-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logo}
              alt={config.libraryName}
              className="h-11 w-11 rounded-full bg-[#fafbbb] object-contain p-1 ring-1 ring-amber-200 dark:ring-stone-700"
            />
            <div className="leading-tight">
              <div className="text-lg font-bold text-stone-900 dark:text-stone-50">
                {config.libraryName}
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400">
                {t.appTitle}
              </div>
            </div>
          </Link>
          <ModeSwitch />
        </div>
      </header>

      <main
        id="main-content"
        className="mx-auto w-full max-w-5xl flex-1 px-4 py-6"
      >
        <Outlet />
      </main>

      <footer className="flex flex-col items-center gap-1 py-4 text-center text-xs text-stone-600 dark:text-stone-400">
        <span className="flex flex-wrap items-center justify-center gap-1.5">
          <span>{config.libraryName}</span>
          <span aria-hidden className="text-stone-400 dark:text-stone-500">
            •
          </span>
          <span>{t.madeWithLove}</span>
        </span>
        <span className="flex items-center gap-2">
          <Link
            to="/stats"
            className="text-amber-700 hover:underline dark:text-amber-400"
          >
            {t.statsPage}
          </Link>
          <span aria-hidden className="text-stone-400 dark:text-stone-500">
            •
          </span>
          <Link
            to="/accessibility"
            className="text-amber-700 hover:underline dark:text-amber-400"
          >
            {t.accessibilityStatement}
          </Link>
          {config.contactEmail && (
            <>
              <span aria-hidden className="text-stone-400 dark:text-stone-500">
                •
              </span>
              <a
                href={`mailto:${config.contactEmail}`}
                className="text-amber-700 hover:underline dark:text-amber-400"
              >
                {t.contactLink}
              </a>
            </>
          )}
        </span>
      </footer>
    </div>
  );
}
