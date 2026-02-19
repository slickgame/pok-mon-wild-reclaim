/**
 * Game Time System
 * Manages in-game time progression, formatting, and calculations.
 */

export const TIME_CONSTANTS = {
  HOURS_PER_DAY: 24,
  MINUTES_PER_HOUR: 60,
  MINUTES_PER_DAY: 24 * 60,
  DAYS_PER_WEEK: 7,
  DAYS_PER_MONTH: 28,
  WEEKS_PER_SEASON: 4,
  MONTHS_PER_YEAR: 4,
};

const SEASON_NAMES = ['Spring', 'Summer', 'Autumn', 'Winter'];

export function normalizeGameTime(gameTime) {
  return {
    currentHour: gameTime?.currentHour ?? 8,
    currentMinute: gameTime?.currentMinute ?? 0,
    currentDay: gameTime?.currentDay ?? 1,
    currentWeek: gameTime?.currentWeek ?? 1,
    day: gameTime?.day ?? 1,
    month: gameTime?.month ?? 0,
    year: gameTime?.year ?? 1,
    currentSeason: gameTime?.currentSeason ?? 'Spring',
  };
}

export function toTotalMinutes(normalized) {
  const year = normalized.year ?? 1;
  const month = normalized.month ?? 0;
  const day = normalized.day ?? normalized.currentDay ?? 1;
  const hour = normalized.currentHour ?? 0;
  const minute = normalized.currentMinute ?? 0;

  const daysPerYear = TIME_CONSTANTS.DAYS_PER_MONTH * TIME_CONSTANTS.MONTHS_PER_YEAR;

  return (
    (year - 1) * daysPerYear * TIME_CONSTANTS.MINUTES_PER_DAY +
    month * TIME_CONSTANTS.DAYS_PER_MONTH * TIME_CONSTANTS.MINUTES_PER_DAY +
    (day - 1) * TIME_CONSTANTS.MINUTES_PER_DAY +
    hour * TIME_CONSTANTS.MINUTES_PER_HOUR +
    minute
  );
}

export function advanceGameTime(normalized, minutesToAdd) {
  let totalMinutes = toTotalMinutes(normalized) + minutesToAdd;

  const daysPerYear = TIME_CONSTANTS.DAYS_PER_MONTH * TIME_CONSTANTS.MONTHS_PER_YEAR;
  const minutesPerYear = daysPerYear * TIME_CONSTANTS.MINUTES_PER_DAY;

  const year = Math.floor(totalMinutes / minutesPerYear) + 1;
  totalMinutes = totalMinutes % minutesPerYear;

  const month = Math.floor(totalMinutes / (TIME_CONSTANTS.DAYS_PER_MONTH * TIME_CONSTANTS.MINUTES_PER_DAY));
  totalMinutes = totalMinutes % (TIME_CONSTANTS.DAYS_PER_MONTH * TIME_CONSTANTS.MINUTES_PER_DAY);

  const day = Math.floor(totalMinutes / TIME_CONSTANTS.MINUTES_PER_DAY) + 1;
  totalMinutes = totalMinutes % TIME_CONSTANTS.MINUTES_PER_DAY;

  const currentHour = Math.floor(totalMinutes / TIME_CONSTANTS.MINUTES_PER_HOUR);
  const currentMinute = totalMinutes % TIME_CONSTANTS.MINUTES_PER_HOUR;

  const currentSeason = SEASON_NAMES[month % 4] ?? 'Spring';

  const absoluteDay =
    (year - 1) * daysPerYear +
    month * TIME_CONSTANTS.DAYS_PER_MONTH +
    (day - 1);
  const currentDay = (absoluteDay % TIME_CONSTANTS.DAYS_PER_WEEK) + 1;
  const currentWeek = Math.floor(absoluteDay / TIME_CONSTANTS.DAYS_PER_WEEK) + 1;

  return { currentHour, currentMinute, currentDay, currentWeek, day, month, year, currentSeason };
}

export function getAbsoluteDayIndex(gameTime) {
  const n = normalizeGameTime(gameTime);
  const daysPerYear = TIME_CONSTANTS.DAYS_PER_MONTH * TIME_CONSTANTS.MONTHS_PER_YEAR;
  return (n.year - 1) * daysPerYear + n.month * TIME_CONSTANTS.DAYS_PER_MONTH + (n.day - 1);
}

export function getCurrentPhase(normalized) {
  const hour = normalized?.currentHour ?? 8;
  if (hour >= 5 && hour < 7) return 'Dawn';
  if (hour >= 7 && hour < 18) return 'Day';
  if (hour >= 18 && hour < 20) return 'Dusk';
  return 'Night';
}

export function formatDigitalTime(normalized) {
  const h = String(normalized?.currentHour ?? 0).padStart(2, '0');
  const m = String(normalized?.currentMinute ?? 0).padStart(2, '0');
  return `${h}:${m}`;
}

export function formatCalendarDate(normalized) {
  const seasonNames = ['Spring', 'Summer', 'Autumn', 'Winter'];
  const season = seasonNames[normalized?.month % 4] ?? normalized?.currentSeason ?? 'Spring';
  const day = normalized?.day ?? normalized?.currentDay ?? 1;
  const year = normalized?.year ?? 1;
  return `Day ${day}, ${season} Y${year}`;
}

export function getTimeLeftLabel(currentTotalMinutes, targetTotalMinutes) {
  const diff = targetTotalMinutes - currentTotalMinutes;
  if (diff <= 0) return 'Expired';

  const days = Math.floor(diff / TIME_CONSTANTS.MINUTES_PER_DAY);
  const hours = Math.floor((diff % TIME_CONSTANTS.MINUTES_PER_DAY) / TIME_CONSTANTS.MINUTES_PER_HOUR);
  const minutes = diff % TIME_CONSTANTS.MINUTES_PER_HOUR;

  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}