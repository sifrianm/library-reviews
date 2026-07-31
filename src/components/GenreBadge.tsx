// A pill badge for a book's genre (סוגה), styled like the rank badge but in a
// distinct sky-blue so it reads as a different kind of label.
export function GenreBadge({ value }: { value: string }) {
  if (!value) return null;
  return (
    <span
      className="inline-flex items-center rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-medium text-sky-800 ring-1 ring-inset ring-sky-600/20 dark:bg-sky-900/40 dark:text-sky-300 dark:ring-sky-400/20"
      dir="auto"
    >
      {value}
    </span>
  );
}
