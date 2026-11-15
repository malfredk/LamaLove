import { WEDDING_DATE } from './wedding.mjs';

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

/** @type {Forecast} */
export const FALLBACK = {
  date: WEDDING_DATE,
  source: 'fallback',
  icon: 'rain',
  description: '',
};
