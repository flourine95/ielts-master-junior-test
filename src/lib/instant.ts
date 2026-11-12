/**
 * Instant helpers.
 *
 * Values reaching these functions have already passed `instantSchema`, so there
 * is exactly one place that decides which timestamp strings are legal.
 */

/** Epoch milliseconds. Throws rather than guessing when the string is invalid. */
export function parseInstant(value: string): number {
  const ms = Date.parse(value);
  if (Number.isNaN(ms)) {
    throw new Error(`Unparseable timestamp: "${value}"`);
  }

  return ms;
}

const VIETNAM_TIME = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Ho_Chi_Minh",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** "dd/mm/yyyy hh:mm" in GMT+7, whatever timezone the server runs in. */
export function formatVietnamTime(ms: number): string {
  const parts = VIETNAM_TIME.formatToParts(new Date(ms));
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${get("day")}/${get("month")}/${get("year")} ${get("hour")}:${get("minute")}`;
}
