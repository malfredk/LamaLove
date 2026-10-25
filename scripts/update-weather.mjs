import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { FALLBACK, osloTime, selectForecast } from './weather.mjs';
import { WEDDING_DATE, LOCATION_FORECAST_DAYS, isForecastWindow } from '../src/config/wedding.mjs';

const destination = new URL('../src/data/weather.json', import.meta.url);
const cacheFile = new URL('../.cache/weather-api.json', import.meta.url);
const today = osloTime(new Date()).date;
const userAgent = 'LamaLove/1.0 https://github.com/malfredk/LamaLove';
let cache = {};
try { cache = JSON.parse(await readFile(cacheFile, 'utf8')); } catch {}

async function fetchForecast(product) {
  const previous = cache[product];
  if (previous && Date.parse(previous.expires) > Date.now()) return previous.payload;
  const headers = { 'User-Agent': userAgent, Accept: 'application/json' };
  if (previous?.lastModified) headers['If-Modified-Since'] = previous.lastModified;
  try {
    const endpoint = `https://api.met.no/weatherapi/${product}/complete?lat=60.3929&lon=5.3242`;
    const response = await fetch(endpoint, { headers, signal: AbortSignal.timeout(20000) });
    if (response.status !== 304 && !response.ok) throw new Error(`HTTP ${response.status}`);
    if (response.status === 203) console.warn(`${product}: API version is deprecated.`);
    const payload = response.status === 304 ? previous?.payload : await response.json();
    if (!Array.isArray(payload?.properties?.timeseries)) throw new Error('Invalid forecast response');
    cache[product] = {
      payload,
      expires: response.headers.get('expires') ?? new Date(Date.now() + 3600000).toUTCString(),
      lastModified: response.headers.get('last-modified') ?? previous?.lastModified,
    };
    return payload;
  } catch (error) {
    console.warn(`${product}: ${error.message}; using the saved forecast if available.`);
    return previous?.payload ?? null;
  }
}

let forecast = { ...FALLBACK };
if (isForecastWindow(today)) {
  // Sequential requests keep traffic low; no requests before the date can be covered.
  const subseasonal = await fetchForecast('subseasonal/1.0');
  const daysRemaining = (Date.parse(WEDDING_DATE) - Date.parse(today)) / 86400000;
  const location = daysRemaining <= LOCATION_FORECAST_DAYS ? await fetchForecast('locationforecast/2.0') : null;
  forecast = selectForecast(location, subseasonal);
  // Preserve the last forecast for this date across transient outages.
  if (forecast.source === 'fallback') {
    try {
      const saved = JSON.parse(await readFile(destination, 'utf8'));
      if (saved.date === WEDDING_DATE && saved.source !== 'fallback') forecast = saved;
    } catch {}
  }
} else if (today > WEDDING_DATE) {
  try {
    const saved = JSON.parse(await readFile(destination, 'utf8'));
    if (saved.date === WEDDING_DATE) {
      console.log('Wedding date has passed; preserving the last saved forecast.');
      process.exit(0);
    }
  } catch {}
}
await mkdir(new URL('../src/data/', import.meta.url), { recursive: true });
await writeFile(destination, JSON.stringify(forecast, null, 2) + '\n');
await mkdir(new URL('../.cache/', import.meta.url), { recursive: true });
await writeFile(cacheFile, JSON.stringify(cache));
console.log(`Weather for ${WEDDING_DATE}: ${forecast.source} — ${forecast.description}`);
