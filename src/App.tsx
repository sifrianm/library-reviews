import { useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import bookshelfBg from "./assets/bookshelf-bg.jpg";
import logo from "./assets/logo.jpg";
import { config } from "./config";
import { t } from "./strings";
import { ModeSwitch } from "./theme";

export default function App() {
  // Load the optional UserWay accessibility toolbar when an account id is set.
  useEffect(() => {
    const account = config.accessibilityWidgetAccountId;
    if (!account || document.getElementById("userway-widget-script")) return;
    const s = document.createElement("script");
    s.id = "userway-widget-script";
    s.src = "https://cdn.userway.org/widget.js";
    s.setAttribute("data-account", account);
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

      {/* subtle colorful bookshelf backdrop, muted behind a paper/dark overlay */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bookshelfBg})` }}
        />
        <div className="absolute inset-0 bg-[#f6f1e7]/[0.78] dark:bg-[#1a1613]/[0.90]" />
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
          <svg
            className="h-3.5 w-3.5 flex-none text-rose-500"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden
          >
            <path d="M10 17.5l-1.09-.99C5.14 13.09 2.5 10.71 2.5 7.75 2.5 5.4 4.34 3.5 6.75 3.5c1.36 0 2.66.63 3.25 1.64.59-1.01 1.89-1.64 3.25-1.64 2.41 0 4.25 1.9 4.25 4.25 0 2.96-2.64 5.34-6.41 8.76L10 17.5z" />
          </svg>
          <span>{t.madeWithLove}</span>
        </span>
        <Link
          to="/accessibility"
          className="text-amber-700 hover:underline dark:text-amber-400"
        >
          {t.accessibilityStatement}
        </Link>
      </footer>
    </div>
  );
}
