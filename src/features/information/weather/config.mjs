import { WEDDING_DATE } from '../../../common/config/wedding.mjs';

/**
 * @typedef {Object} Forecast
 * @property {string} [date]
 * @property {string} [source]
 * @property {string} [icon]
 * @property {string} [description]
 * @property {number} [precipitationProbability]
 * @property {number} [temperature]
 * @property {number} [temperatureMin]
 * @property {number} [temperatureMax]
 * @property {string} [period]
 * @property {string | null} [updatedAt]
 */

export const WEATHER_LOCATION = { latitude: 60.3929, longitude: 5.3242 };
export const FORECAST_URL = 'https://www.yr.no/nb/v%C3%A6rvarsel/daglig-tabell/1-92416/Norge/Vestland/Bergen/Bergen';
export const RAIN_PROBABILITY_THRESHOLD_PERCENT = 50;
export const FORECAST_DAYS = 21;
export const LOCATION_FORECAST_DAYS = 10;

export function daysBefore(date, days) {
  const result = new Date(`${date}T12:00:00Z`);
  result.setUTCDate(result.getUTCDate() - days);
  return result.toISOString().slice(0, 10);
}

export const WEATHER_START = daysBefore(WEDDING_DATE, FORECAST_DAYS);

export function isForecastWindow(today, weddingDate = WEDDING_DATE) {
  return today >= daysBefore(weddingDate, FORECAST_DAYS) && today <= weddingDate;
}

/** @type {Forecast} */
export const FALLBACK = {
  date: WEDDING_DATE,
  source: 'fallback',
  icon: 'rain',
  description: '',
};
