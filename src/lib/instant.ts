/**
 * Instant helpers.
 *
 * Every timestamp in this project is an ISO-8601 string WITH an explicit UTC
 * offset (e.g. "2026-11-11T09:00:00+07:00"). Parsing and formatting are kept in
 * one place so that both "now" and the fixture data follow the same rules.
 *
 * Why the strict regex: `Date.parse("2026-11-13T23:59:00")` has no offset, so
 * the runtime silently interprets it in the *server's* timezone. That is the
 * classic bug this exercise is guarding against, so an offset-less string is a
 * hard error instead of a guess.
 */

const ISO_WITH_OFFSET = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;

export function parseInstant(value: string): number {
  if (!ISO_WITH_OFFSET.test(value)) {
    throw new Error(
      `Timestamp must be ISO-8601 with an explicit UTC offset, got "${value}"`
    );
  }

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

/**
 * Formats an epoch timestamp as "dd/mm/yyyy hh:mm" in GMT+7, independent of the
 * timezone the app happens to run in.
 */
export function formatVietnamTime(ms: number): string {
  const parts = VIETNAM_TIME.formatToParts(new Date(ms));
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${get("day")}/${get("month")}/${get("year")} ${get("hour")}:${get("minute")}`;
}
