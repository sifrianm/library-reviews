// All user-facing Hebrew text in one place for easy editing.

export const t = {
  appTitle: "ביקורות ספרים",
  tagline: "מה הקוראים שלנו חושבים על הספרים בספרייה",

  // Accessibility
  skipToContent: "דילוג לתוכן הראשי",
  accessibilityStatement: "הצהרת נגישות",

  // Contact
  contactLink: "צור קשר",

  // Stats page
  statsPage: "נתונים וסטטיסטיקה",
  statsBooks: "ספרים",
  statsReviews: "ביקורות",
  statsReaders: "קוראים",
  statsAdultsKidsSplit: (adults: number, kids: number) =>
    `מבוגרים ${adults} · ילדים ${kids}`,
  statsByRank: "התפלגות לפי דירוג",
  statsByGenre: "התפלגות לפי סוגה (ספרי מבוגרים)",
  statsMostReviewed: "הספרים עם הכי הרבה ביקורות",
  statsActiveReaders: "הקוראים הפעילים ביותר",
  statsByMonth: "ביקורות לפי חודש",
  statsNoRank: "ללא דירוג",
  statsAnonymous: "ללא שם",
  statsEmpty: "אין עדיין נתונים להצגה.",
  statsLoadTimes: "זמני טעינה ראשונית (קור)",
  statsLoadPending: "טוען…",
  statsMs: (ms: number) =>
    ms >= 1000 ? `${(ms / 1000).toFixed(2)} שנ׳` : `${Math.round(ms)} מ״ש`,

  // Footer credit
  madeWithLove: "נוצר לספרייה ב ❤️ ע״י משפחת נמיר",

  // Home
  writeReview: "כתיבת ביקורת",
  writeReviewSub: "מילוי טופס ביקורת על ספר שקראתם",
  browseReviews: "עיון בביקורות",
  browseReviewsKids: "עיון בביקורות — ספרי ילדים",
  browseReviewsSub: "חיפוש ועיון בביקורות של הקוראים",
  formUnavailable: "קישור הטופס יתווסף בקרוב",

  // Home sections
  adultsSection: "ספרי מבוגרים",
  childrenSection: "ספרי ילדים",
  comingSoon: "בקרוב",

  // Reviews page
  backHome: "חזרה לדף הבית",

  // Write (form) page
  openFormFullPage: "פתיחת הטופס בחלון חדש",
  formLoading: "טוען את הטופס...",
  searchPlaceholder: "חיפוש...",
  searchScopeLabel: "היקף החיפוש",
  searchScopeAll: "הכל",
  searchScopeBook: "שם הספר",
  searchScopeAuthor: "שם הסופר/ת",
  searchScopeReader: "שם הקורא/ת",

  genreLabel: "סוגה",
  genreAll: "כל הסוגות",

  sortLabel: "מיון",
  sortNewest: "החדשות ביותר",
  sortBookAsc: "שם הספר (א-ת)",
  sortAuthorAsc: "שם הסופר/ת (א-ת)",
  sortRankDesc: "דירוג גבוה לנמוך",
  sortRankAsc: "דירוג נמוך לגבוה",
  sortMostReviewed: "הכי הרבה ביקורות",
  sortGenreAsc: "לפי סוגה (א-ת)",

  clearFilters: "ניקוי חיפוש",
  loadMore: "עוד ביקורות",

  resultsCount: (books: number, reviews: number) =>
    `${books} ספרים · ${reviews} ביקורות`,
  reviewsCount: (n: number) => (n === 1 ? "ביקורת אחת" : `${n} ביקורות`),
  averageRank: "דירוג ממוצע",
  by: "מאת",

  showMore: "עוד",
  showLess: "פחות",

  loading: "טוען ביקורות...",
  emptyState: "לא נמצאו ביקורות התואמות את החיפוש.",
  errorTitle: "אירעה שגיאה בטעינת הביקורות",
  retry: "נסו שוב",
} as const;
