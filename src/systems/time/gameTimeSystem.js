const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const DAYS_PER_MONTH = 30;
const MONTHS_PER_YEAR = 12;
const MINUTES_PER_DAY = MINUTES_PER_HOUR * HOURS_PER_DAY;
const MINUTES_PER_MONTH = MINUTES_PER_DAY * DAYS_PER_MONTH;
const MINUTES_PER_YEAR = MINUTES_PER_MONTH * MONTHS_PER_YEAR;

export const TIME_CONSTANTS = {
  MINUTES_PER_HOUR,
  HOURS_PER_DAY,
  DAYS_PER_MONTH,
  MONTHS_PER_YEAR,
  MINUTES_PER_DAY,
  MINUTES_PER_MONTH,
  MINUTES_PER_YEAR
};

export function normalizeGameTime(gameTime) {
  const hour = Number.isFinite(gameTime?.currentHour) ? gameTime.currentHour : 6;
  const minute = Number.isFinite(gameTime?.currentMinute) ? gameTime.currentMinute : 0;
  const day = Number.isFinite(gameTime?.day) ? gameTime.day : 1;
  const month = Number.isFinite(gameTime?.month) ? gameTime.month : 0;
  const year = Number.isFinite(gameTime?.year) ? gameTime.year : 0;

  const normalized = fromTotalMinutes(toTotalMinutes({ hour, minute, day, month, year }));
  return {
    ...gameTime,
    currentHour: normalized.hour,
    currentMinute: normalized.minute,
    day: normalized.day,
    month: normalized.month,
    year: normalized.year,
    currentDay: normalized.dayOfWeek,
    currentWeek: Math.floor((normalized.absoluteDay - 1) / 7) + 1
  };
}

export function toTotalMinutes(gameTime) {
  const hour = Number.isFinite(gameTime?.currentHour) ? gameTime.currentHour : (Number.isFinite(gameTime?.hour) ? gameTime.hour : 6);
  const minute = Number.isFinite(gameTime?.currentMinute) ? gameTime.currentMinute : (Number.isFinite(gameTime?.minute) ? gameTime.minute : 0);
  const day = Number.isFinite(gameTime?.day) ? gameTime.day : 1;
  const month = Number.isFinite(gameTime?.month) ? gameTime.month : 0;
  const year = Number.isFinite(gameTime?.year) ? gameTime.year : 0;

  return (year * MINUTES_PER_YEAR)
    + (month * MINUTES_PER_MONTH)
    + ((day - 1) * MINUTES_PER_DAY)
    + (hour * MINUTES_PER_HOUR)
    + minute;
}

export function fromTotalMinutes(totalMinutes = 0) {
  const safeTotal = Math.max(0, Math.floor(totalMinutes));

  const year = Math.floor(safeTotal / MINUTES_PER_YEAR);
  const remainderAfterYear = safeTotal % MINUTES_PER_YEAR;

  const month = Math.floor(remainderAfterYear / MINUTES_PER_MONTH);
  const remainderAfterMonth = remainderAfterYear % MINUTES_PER_MONTH;

  const day = Math.floor(remainderAfterMonth / MINUTES_PER_DAY) + 1;
  const remainderAfterDay = remainderAfterMonth % MINUTES_PER_DAY;

  const hour = Math.floor(remainderAfterDay / MINUTES_PER_HOUR);
  const minute = remainderAfterDay % MINUTES_PER_HOUR;

  const absoluteDay = (year * MONTHS_PER_YEAR * DAYS_PER_MONTH) + (month * DAYS_PER_MONTH) + day;
  const dayOfWeek = ((absoluteDay - 1) % 7) + 1;

  return {
    year,
    month,
    day,
    hour,
    minute,
    absoluteDay,
    dayOfWeek
  };
}

export function advanceGameTime(gameTime, minutesToAdvance = 0) {
  const nextTotalMinutes = toTotalMinutes(normalizeGameTime(gameTime)) + Math.max(0, Math.floor(minutesToAdvance));
  const rebuilt = fromTotalMinutes(nextTotalMinutes);
  return {
    ...gameTime,
    currentHour: rebuilt.hour,
    currentMinute: rebuilt.minute,
    day: rebuilt.day,
    month: rebuilt.month,
    year: rebuilt.year,
    currentDay: rebuilt.dayOfWeek,
    currentWeek: Math.floor((rebuilt.absoluteDay - 1) / 7) + 1
  };
}

export function getCurrentPhase(gameTime) {
  const normalized = normalizeGameTime(gameTime);
  const minuteOfDay = normalized.currentHour * 60 + normalized.currentMinute;
  const isNight = minuteOfDay >= (18 * 60 + 1) || minuteOfDay <= (5 * 60 + 59);
  return isNight ? 'Night' : 'Day';
}

export function formatDigitalTime(gameTime) {
  const normalized = normalizeGameTime(gameTime);
  const hour24 = normalized.currentHour;
  const minute = String(normalized.currentMinute).padStart(2, '0');
  const period = hour24 >= 12 ? 'P.M.' : 'A.M.';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${minute} ${period}`;
}

export function formatCalendarDate(gameTime) {
  const normalized = normalizeGameTime(gameTime);
  return `${String(normalized.day).padStart(2, '0')} day, ${String(normalized.month).padStart(2, '0')} month, ${String(normalized.year).padStart(4, '0')} year`;
}

export function getTimeLeftLabel(currentTotalMinutes, targetTotalMinutes) {
  if (!Number.isFinite(targetTotalMinutes)) return 'No expiry';
  const diff = Math.floor(targetTotalMinutes - currentTotalMinutes);
  if (diff <= 0) return 'Expired';

  const days = Math.floor(diff / MINUTES_PER_DAY);
  const hours = Math.floor((diff % MINUTES_PER_DAY) / MINUTES_PER_HOUR);
  const minutes = diff % MINUTES_PER_HOUR;

  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

export function getAbsoluteDayIndex(gameTime) {
  return fromTotalMinutes(toTotalMinutes(normalizeGameTime(gameTime))).absoluteDay;
}
