// Utility helpers

/**
 * Conditionally joins class names — lightweight cn() implementation.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Formats a number with a unit label.
 */
export function pluralize(n: number, singular: string, plural?: string): string {
  return `${n} ${n === 1 ? singular : (plural ?? singular + "s")}`;
}

/**
 * Returns a relative time string like "2 minutes ago".
 */
export function relativeTime(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return new Date(dateString).toLocaleDateString();
}
