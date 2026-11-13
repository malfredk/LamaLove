import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { FALLBACK, osloTime, selectForecast } from './weather.mjs';
import { WEDDING_DATE, LOCATION_FORECAST_DAYS, isForecastWindow } from '../src/config/wedding.mjs';

const FORECAST_FILE = new URL('../src/data/weather.json', import.meta.url);
const CACHE_FILE = new URL('../.cache/weather-api.json', import.meta.url);
const USER_AGENT = 'LamaLove/1.0 https://github.com/malfredk/LamaLove';
const REQUEST_TIMEOUT_MS = 20000;
const DEFAULT_CACHE_DURATION_MS = 3600000;
const DAY_MS = 86400000;

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function forecastRequestHeaders(previous) {
  const headers = { 'User-Agent': USER_AGENT, Accept: 'application/json' };
  if (previous?.lastModified) headers['If-Modified-Since'] = previous.lastModified;
  return headers;
}

function validateForecastResponse(response, product) {
  if (response.status !== 304 && !response.ok) throw new Error(`HTTP ${response.status}`);
  if (response.status === 203) console.warn(`${product}: API version is deprecated.`);
}

function createCacheEntry(payload, response, previous) {
  return {
    payload,
    expires: response.headers.get('expires') ?? new Date(Date.now() + DEFAULT_CACHE_DURATION_MS).toUTCString(),
    lastModified: response.headers.get('last-modified') ?? previous?.lastModified,
  };
}

async function fetchForecast(product, cache) {
  const previous = cache[product];
  if (previous && Date.parse(previous.expires) > Date.now()) return previous.payload;
  const headers = forecastRequestHeaders(previous);
  try {
    const endpoint = `https://api.met.no/weatherapi/${product}/complete?lat=60.3929&lon=5.3242`;
    const response = await fetch(endpoint, { headers, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
    validateForecastResponse(response, product);
    const payload = response.status === 304 ? previous?.payload : await response.json();
    if (!Array.isArray(payload?.properties?.timeseries)) throw new Error('Invalid forecast response');
    cache[product] = createCacheEntry(payload, response, previous);
    return payload;
  } catch (error) {
    console.warn(`${product}: ${error.message}; using the saved forecast if available.`);
    return previous?.payload ?? null;
  }
}

async function forecastForWedding(today, cache) {
  // Sequential requests keep traffic low; no requests before the date can be covered.
  const subseasonal = await fetchForecast('subseasonal/1.0', cache);
  const daysRemaining = (Date.parse(WEDDING_DATE) - Date.parse(today)) / DAY_MS;
  const location = daysRemaining <= LOCATION_FORECAST_DAYS
    ? await fetchForecast('locationforecast/2.0', cache)
    : null;
  const forecast = selectForecast(location, subseasonal);

  // Preserve the last forecast for this date across transient outages.
  if (forecast.source === 'fallback') {
    const saved = await readJson(FORECAST_FILE, null);
    if (saved?.date === WEDDING_DATE && saved.source !== 'fallback') return saved;
  }
  return forecast;
}

async function saveForecast(forecast, cache) {
  await mkdir(new URL('../src/data/', import.meta.url), { recursive: true });
  await writeFile(FORECAST_FILE, JSON.stringify(forecast, null, 2) + '\n');
  await mkdir(new URL('../.cache/', import.meta.url), { recursive: true });
  await writeFile(CACHE_FILE, JSON.stringify(cache));
}

async function updateWeather() {
  const today = osloTime(new Date()).date;
  const cache = await readJson(CACHE_FILE, {});
  let forecast = { ...FALLBACK };

  if (isForecastWindow(today)) {
    forecast = await forecastForWedding(today, cache);
  } else if (today > WEDDING_DATE) {
    const saved = await readJson(FORECAST_FILE, null);
    if (saved?.date === WEDDING_DATE) {
      console.log('Wedding date has passed; preserving the last saved forecast.');
      process.exit(0);
    }
  }

  await saveForecast(forecast, cache);
  console.log(`Weather for ${WEDDING_DATE}: ${forecast.source} — ${forecast.description}`);
}

await updateWeather();
