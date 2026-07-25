import { Link } from "react-router-dom";
import { config } from "../config";
import { t } from "../strings";

const LAST_UPDATED = "יולי 2026";

export function Accessibility() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">
          {t.accessibilityStatement}
        </h1>
        <Link
          to="/"
          className="text-sm text-amber-700 hover:underline dark:text-amber-400"
        >
          {t.backHome}
        </Link>
      </div>

      <div className="space-y-5 text-stone-700 dark:text-stone-300">
        <p>
          {config.libraryName} רואה חשיבות רבה במתן שירות שוויוני לכלל הגולשים,
          ופועלת כדי שהאתר יהיה נגיש לאנשים עם מוגבלות, בהתאם להנחיות הנגישות
          המקובלות.
        </p>

        <section>
          <h2 className="mb-1.5 text-lg font-bold text-stone-900 dark:text-stone-50">
            תקן הנגישות
          </h2>
          <p>
            האתר נבנה בהתאם לתקן הנגישות הישראלי (ת"י 5568), המבוסס על הנחיות
            WCAG 2.0 ברמת התאמה AA.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-lg font-bold text-stone-900 dark:text-stone-50">
            מה הונגש באתר
          </h2>
          <ul className="list-inside list-disc space-y-1">
            <li>ניווט מלא באמצעות מקלדת וסימון ברור של הפוקוס.</li>
            <li>מבנה סמנטי, כותרות מסודרות ואזורי ניווט (header, main, footer).</li>
            <li>טקסט חלופי לתמונות (כולל כריכות ספרים) ולוגו.</li>
            <li>קישור "דילוג לתוכן הראשי" למשתמשי מקלדת וקוראי מסך.</li>
            <li>תוויות (labels) לשדות החיפוש והמיון.</li>
            <li>תמיכה בתצוגה בהירה/כהה ובהעדפת המערכת.</li>
            <li>תמיכה בכיווניות ימין-לשמאל ובעברית.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-1.5 text-lg font-bold text-stone-900 dark:text-stone-50">
            מגבלות ידועות
          </h2>
          <p>
            חלק מהתכנים מגיעים משירותים חיצוניים — טופס הגשת הביקורת (Google
            Forms) ותמונות כריכה ממקורות ברשת — ולכן ייתכן שרמת הנגישות שלהם אינה
            בשליטתנו המלאה. אנו פועלים לצמצם מגבלות אלו.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-lg font-bold text-stone-900 dark:text-stone-50">
            פנייה בנושא נגישות
          </h2>
          <p>
            נתקלתם בבעיית נגישות או שיש לכם הצעה לשיפור? נשמח לשמוע ולטפל בכך
            בהקדם.{" "}
            {config.accessibilityContactEmail ? (
              <>
                ניתן לפנות בדוא"ל:{" "}
                <a
                  href={`mailto:${config.accessibilityContactEmail}`}
                  className="text-amber-700 hover:underline dark:text-amber-400"
                  dir="ltr"
                >
                  {config.accessibilityContactEmail}
                </a>
                .
              </>
            ) : (
              <span className="text-stone-500 dark:text-stone-400">
                [יש להוסיף כתובת דוא"ל ליצירת קשר בנושא נגישות]
              </span>
            )}
          </p>
        </section>

        <p className="pt-2 text-sm text-stone-500 dark:text-stone-400">
          הצהרת הנגישות עודכנה לאחרונה: {LAST_UPDATED}.
        </p>
      </div>
    </div>
  );
}
