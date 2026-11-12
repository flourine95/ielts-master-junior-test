import { parseInstant, formatVietnamTime } from "./instant";

/**
 * The exercise fixes "now" at 11/11/2026 09:00 (GMT+7). Real wall-clock time is
 * never consulted, so the statuses are reproducible on any machine, in any
 * timezone, on any day. Tests import this constant instead of faking timers.
 */
export const SIMULATED_NOW_ISO = "2026-11-11T09:00:00+07:00";
export const SIMULATED_NOW = parseInstant(SIMULATED_NOW_ISO);
export const SIMULATED_NOW_LABEL = formatVietnamTime(SIMULATED_NOW);
