import test from 'node:test';
import assert from 'node:assert/strict';
import { osloTime, selectForecast as select, selectLocationForecast as selectLocation, selectSubseasonalForecast as selectSubseasonal } from './selection.mjs';
import { FALLBACK, WEATHER_START, daysBefore, isForecastWindow } from './config.mjs';
import { fetchForecast } from './update.mjs';
import { WEDDING_DATE } from '../../../common/config/wedding.mjs';
import { WEATHER_MESSAGES } from './copy.mjs';
import { weatherIllustration, weatherIntroduction, weatherRainChance, weatherTemperature } from './presentation.mjs';

// Fixtures deliberately use a fixed date, independent of the site's configured date.
const FIXTURE_DATE = '2027-09-04';
const selectForecast = (location, subseasonal) => select(location, subseasonal, FIXTURE_DATE);
const selectLocationForecast = payload => selectLocation(payload, FIXTURE_DATE);
const selectSubseasonalForecast = payload => selectSubseasonal(payload, FIXTURE_DATE);

test('couple illustrations distinguish reliable weather from uncertain forecasts', () => {
  assert.equal(weatherIllustration(FALLBACK), 'couple-umbrella');
  assert.equal(weatherIllustration(undefined), 'couple-umbrella');
  for (const precipitationProbability of [15, 53, 80]) {
    assert.equal(weatherIllustration({ source: 'subseasonal', icon: 'rain', precipitationProbability }), 'couple-uncertain');
  }
  assert.equal(weatherIllustration({ source: 'locationforecast', icon: 'sun' }), 'couple-sun');
  for (const icon of ['cloud', 'partly-cloudy']) {
    assert.equal(weatherIllustration({ source: 'locationforecast', icon }), 'couple-clouds');
  }
  for (const icon of ['rain', 'thunder', 'snow']) {
    assert.equal(weatherIllustration({ source: 'locationforecast', icon }), 'couple-umbrella');
  }
  assert.equal(weatherIllustration({ source: 'locationforecast', icon: 'unknown' }), 'couple-uncertain');
});

test('weather introductions distinguish fallback, sunshine, dry clouds, and rain', () => {
  assert.equal(weatherIntroduction(FALLBACK), WEATHER_MESSAGES.fallback);
  for (const icon of ['cloud', 'partly-cloudy']) {
    assert.equal(weatherIntroduction({ source: 'locationforecast', icon }), WEATHER_MESSAGES.dry);
  }
  assert.equal(weatherIntroduction({ source: 'locationforecast', icon: 'sun' }), WEATHER_MESSAGES.sun);
  for (const icon of ['rain', 'thunder']) {
    assert.equal(weatherIntroduction({ source: 'locationforecast', icon }), WEATHER_MESSAGES.rain);
  }
});

test('long-range introductions use probability rather than the default rain icon', () => {
  assert.equal(weatherIntroduction({ source: 'subseasonal', icon: 'rain', precipitationProbability: 15 }), WEATHER_MESSAGES.notRain);
  assert.equal(weatherIntroduction({ source: 'subseasonal', precipitationProbability: 80 }), WEATHER_MESSAGES.rain);
  assert.equal(weatherIntroduction({ source: 'subseasonal', description: '53% sjanse for regn' }), WEATHER_MESSAGES.rain);
  assert.equal(weatherIntroduction({ source: 'subseasonal' }), WEATHER_MESSAGES.other);
});

const payload = (...timeseries) => ({ properties: { meta: { updated_at: '2027-08-28T10:00:00Z' }, timeseries } });
const location = (time, hours = 6, code = 'partlycloudy_day') => ({ time, data: {
  instant: { details: { air_temperature: 16.4 } },
  [`next_${hours}_hours`]: { summary: { symbol_code: code } },
} });
const daily = (time = '2027-09-04T00:00:00Z') => ({ time, data: { next_24_hours: { details: {
  air_temperature_min: 11.2, air_temperature_max: 17.8, probability_of_precipitation: 73.4,
} } } });

test('fallback when wedding day is outside forecast range', () => {
  assert.deepEqual(selectForecast(payload(location('2026-10-26T12:00:00Z')), payload(daily('2026-10-26T00:00:00Z'))), { ...FALLBACK, date: FIXTURE_DATE });
  assert.deepEqual(selectForecast(null, null), { ...FALLBACK, date: FIXTURE_DATE });
});
test('selects the wedding day from 21-day data without inventing sunshine', () => {
  const forecast = selectForecast(null, payload(daily('2027-09-03T00:00:00Z'), daily()));
  assert.equal(forecast.source, 'subseasonal');
  assert.equal(forecast.description, '73% sjanse for regn');
  assert.equal(forecast.temperatureMin, 11.2);
  assert.equal(forecast.icon, 'rain');
});
test('daily forecast requires real daily temperature and probability data', () => {
  assert.equal(selectSubseasonalForecast(payload({ time: '2027-09-04T00:00:00Z', data: { next_7_days: { details: {} } } })), null);
  assert.equal(selectSubseasonalForecast(payload({ time: '2027-09-04T00:00:00Z', data: { next_24_hours: { details: {} } } })), null);
});
test('Locationforecast takes priority, using 12–18 Norwegian time', () => {
  const forecast = selectForecast(payload(location('2027-09-04T04:00:00Z', 6, 'rain'), location('2027-09-04T10:00:00Z')), payload(daily()));
  assert.equal(forecast.source, 'locationforecast');
  assert.equal(forecast.period, '12:00–18:00');
  assert.equal(forecast.description, 'Lettskyet');
  assert.equal(forecast.temperature, 16.4);
});
test('hourly forecasts use an afternoon period near 15:00', () => {
  const forecast = selectLocationForecast(payload(location('2027-09-04T10:00:00Z', 1), location('2027-09-04T12:00:00Z', 1, 'clearsky_day')));
  assert.equal(forecast.period, '14:00–15:00');
  assert.equal(forecast.icon, 'sun');
});
test('six-hour UTC timesteps still provide an afternoon forecast in Norwegian summer time', () => {
  const forecast = selectLocationForecast(payload(
    location('2027-09-04T06:00:00Z'),
    location('2027-09-04T12:00:00Z', 6, 'rain'),
    location('2027-09-04T18:00:00Z'),
  ));
  assert.equal(forecast.period, '14:00–20:00');
  assert.equal(forecast.description, 'Regn');
});
test('partial wedding-day data without afternoon summary keeps the 21-day forecast', () => {
  const forecast = selectForecast(payload(location('2027-09-04T04:00:00Z')), payload(daily()));
  assert.equal(forecast.source, 'subseasonal');
});
test('uses Europe/Oslo rather than UTC date or machine timezone', () => {
  assert.deepEqual(osloTime('2027-09-03T22:00:00Z'), { date: '2027-09-04', hour: 0 });
  assert.equal(selectLocationForecast(payload(location('2027-09-04T22:00:00Z'))), null);
});

test('configured forecast window is wedding date minus 21 calendar days, inclusive', () => {
  assert.equal(WEATHER_START, daysBefore(WEDDING_DATE, 21));
  assert.equal(isForecastWindow(WEATHER_START), true);
  assert.equal(isForecastWindow(daysBefore(WEATHER_START, 1)), false);
  assert.equal(isForecastWindow(WEDDING_DATE), true);
  assert.equal(isForecastWindow(daysBefore(WEDDING_DATE, -1)), false);
});
test('date arithmetic works across years, leap years, and daylight saving changes', () => {
  assert.equal(daysBefore('2028-01-10', 21), '2027-12-20');
  assert.equal(daysBefore('2028-03-10', 21), '2028-02-18');
  assert.equal(daysBefore('2028-04-10', 21), '2028-03-20');
});
test('selection follows a changed wedding date, rejecting previous-date data', () => {
  const target = '2028-01-10';
  const forecast = select(payload(location('2028-01-10T11:00:00Z')), payload(daily()), target);
  assert.equal(forecast.date, target);
  assert.equal(forecast.source, 'locationforecast');
  assert.equal(forecast.period, '12:00–18:00');
  assert.equal(select(null, payload(daily()), target).source, 'fallback');
  assert.equal(selectSubseasonal(payload(daily('2028-01-10T00:00:00Z')), target).date, target);
});

test('invalid entries cannot hide a later usable forecast', () => {
  const invalidTime = { ...daily(), time: 'invalid' };
  const invalidProbability = daily();
  invalidProbability.data.next_24_hours.details.probability_of_precipitation = 150;
  assert.equal(selectSubseasonalForecast(payload(invalidTime, invalidProbability, daily())).precipitationProbability, 73.4);
  assert.equal(selectLocationForecast(payload({ ...location('invalid') }, location('2027-09-04T10:00:00Z'))).period, '12:00–18:00');
  const invertedTemperatures = daily();
  invertedTemperatures.data.next_24_hours.details.air_temperature_min = 30;
  assert.equal(selectSubseasonalForecast(payload(invertedTemperatures)), null);
});

test('rain probability drives both the introduction and displayed percentage', () => {
  const forecast = { source: 'subseasonal', precipitationProbability: 49.6, description: '80% sjanse for regn' };
  assert.equal(weatherRainChance(forecast), '50% sjanse for regn');
  assert.equal(weatherIntroduction(forecast), WEATHER_MESSAGES.rain);
  assert.equal(weatherIntroduction({ ...forecast, precipitationProbability: 49.4 }), WEATHER_MESSAGES.notRain);
  assert.equal(weatherIntroduction({ ...forecast, precipitationProbability: 50 }), WEATHER_MESSAGES.rain);
  assert.equal(weatherRainChance({ source: 'subseasonal', description: '53 % sjanse for regn' }), '53% sjanse for regn');
  for (const precipitationProbability of [-1, 101, NaN, Infinity]) {
    const invalid = { source: 'subseasonal', precipitationProbability };
    assert.equal(weatherRainChance(invalid), null);
    assert.equal(weatherIntroduction(invalid), WEATHER_MESSAGES.other);
  }
});

test('temperature display handles zero, missing values and invalid ranges', () => {
  assert.equal(weatherTemperature({ temperature: 0 }), '0°');
  assert.equal(weatherTemperature({ temperatureMin: 10.6, temperatureMax: 17.2 }), '11° til 17°');
  for (const forecast of [{}, { temperature: null }, { temperature: NaN }, { temperature: Infinity }, { temperatureMin: 10 }, { temperatureMin: 20, temperatureMax: 10 }]) {
    assert.equal(weatherTemperature(forecast), null);
  }
});

test('fresh raw API cache avoids a request', async () => {
  const cachedPayload = payload(daily());
  const cache = { test: { payload: cachedPayload, expires: '2099-01-01T00:00:00Z' } };
  const forecast = await fetchForecast('test', cache, () => assert.fail('Fresh cache must not call the API'));
  assert.equal(forecast, cachedPayload);
});

test('expired API cache is revalidated and reused for HTTP 304', async () => {
  const cachedPayload = payload(daily());
  const lastModified = 'Wed, 01 Sep 2027 12:00:00 GMT';
  const cache = { test: { payload: cachedPayload, expires: '2000-01-01T00:00:00Z', lastModified } };
  const forecast = await fetchForecast('test', cache, async (url, options) => {
    assert.equal(options.headers['If-Modified-Since'], lastModified);
    assert(options.headers['User-Agent'].includes('LamaLove'));
    return new Response(null, { status: 304, headers: { expires: 'Thu, 02 Sep 2027 12:00:00 GMT' } });
  });
  assert.equal(forecast, cachedPayload);
  assert.equal(cache.test.expires, 'Thu, 02 Sep 2027 12:00:00 GMT');
});

test('successful API response replaces expired cached payload', async () => {
  const nextPayload = payload(daily());
  const cache = {};
  const forecast = await fetchForecast('test', cache, async () => new Response(JSON.stringify(nextPayload), {
    headers: { expires: 'Thu, 02 Sep 2027 12:00:00 GMT' },
  }));
  assert.deepEqual(forecast, nextPayload);
  assert.deepEqual(cache.test.payload, nextPayload);
});

test('failed or malformed API responses retain the cached payload', async (context) => {
  context.mock.method(console, 'warn', () => {});
  const cachedPayload = payload(daily());
  for (const request of [
    async () => { throw new Error('Timeout'); },
    async () => new Response(null, { status: 503 }),
    async () => new Response('{}'),
  ]) {
    const cache = { test: { payload: cachedPayload, expires: '2000-01-01T00:00:00Z' } };
    assert.equal(await fetchForecast('test', cache, request), cachedPayload);
    assert.equal(await fetchForecast('test', {}, request), null);
    assert.equal(cache.test.payload, cachedPayload);
  }
});
