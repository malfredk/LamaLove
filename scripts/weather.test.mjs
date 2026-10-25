import test from 'node:test';
import assert from 'node:assert/strict';
import { FALLBACK, osloTime, selectForecast as select, selectLocationForecast as selectLocation, selectSubseasonalForecast as selectSubseasonal } from './weather.mjs';
import { WEDDING_DATE, WEATHER_START, daysBefore, isForecastWindow } from '../src/config/wedding.mjs';

// Fixtures deliberately use a fixed date, independent of the site's configured date.
const FIXTURE_DATE = '2027-09-04';
const selectForecast = (location, subseasonal) => select(location, subseasonal, FIXTURE_DATE);
const selectLocationForecast = payload => selectLocation(payload, FIXTURE_DATE);
const selectSubseasonalForecast = payload => selectSubseasonal(payload, FIXTURE_DATE);

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
