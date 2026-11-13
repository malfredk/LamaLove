import { WEDDING_DATE, TIME_ZONE } from '../src/config/wedding.mjs';

const HOUR_MS = 3600000;
const AFTERNOON_START_HOUR = 12;
const AFTERNOON_END_HOUR = 18;
const PREFERRED_FORECAST_HOUR = 15;
const HOURLY_SUMMARY_PENALTY = 0.25;

export const FALLBACK = {
  date: WEDDING_DATE,
  source: 'fallback',
  icon: 'rain',
  description: '',
};

const osloDateTimeFormatter = new Intl.DateTimeFormat('sv-SE', {
  timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', hourCycle: 'h23',
});

export function osloTime(timestamp) {
  const parts = Object.fromEntries(
    osloDateTimeFormatter.formatToParts(new Date(timestamp)).map(part => [part.type, part.value]),
  );
  return { date: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour) };
}

export function weatherSymbol(code) {
  if (code.includes('thunder')) return { icon: 'thunder', description: 'Tordenbyger' };
  if (code.includes('snow') || code.includes('sleet')) return { icon: 'snow', description: 'Snø eller sludd' };
  if (code.includes('rain')) return { icon: 'rain', description: code.includes('showers') ? 'Regnbyger' : 'Regn' };
  if (code.includes('clearsky')) return { icon: 'sun', description: 'Sol' };
  if (code.includes('fair') || code.includes('partlycloudy')) return { icon: 'partly-cloudy', description: 'Lettskyet' };
  if (code.includes('fog')) return { icon: 'cloud', description: 'Tåke' };
  return { icon: 'cloud', description: 'Skyet' };
}

export function selectLocationForecast(payload, weddingDate = WEDDING_DATE) {
  const candidates = collectAfternoonCandidates(payload, weddingDate);
  candidates.sort((first, second) => first.score - second.score);
  const selected = candidates[0];
  if (!selected) return null;

  return {
    date: weddingDate,
    source: 'locationforecast',
    ...weatherSymbol(selected.code),
    temperature: selected.temperature,
    period: `${formatHour(selected.start.hour)}–${formatHour(selected.end.hour)}`,
    updatedAt: payload.properties.meta?.updated_at ?? null,
  };
}

function collectAfternoonCandidates(payload, weddingDate) {
  const candidates = [];
  for (const entry of payload?.properties?.timeseries ?? []) {
    const start = osloTime(entry.time);
    const temperature = entry.data?.instant?.details?.air_temperature;
    if (start.date !== weddingDate || !Number.isFinite(temperature)) continue;
    // Prefer an actual six-hour afternoon summary, then hourly summaries.
    for (const hours of [6, 1]) {
      const period = entry.data?.[`next_${hours}_hours`];
      const code = period?.summary?.symbol_code;
      const end = osloTime(new Date(Date.parse(entry.time) + hours * HOUR_MS));
      if (!code || !isAfternoonHour(start.hour) || end.date !== weddingDate) continue;
      candidates.push({
        start,
        end,
        code,
        temperature,
        score: scoreForecastPeriod(start.hour, hours),
      });
    }
  }
  return candidates;
}

function isAfternoonHour(hour) {
  return hour >= AFTERNOON_START_HOUR && hour < AFTERNOON_END_HOUR;
}

function scoreForecastPeriod(startHour, hours) {
  const distanceFromPreferredHour = Math.abs(startHour + hours / 2 - PREFERRED_FORECAST_HOUR);
  return distanceFromPreferredHour + (hours === 6 ? 0 : HOURLY_SUMMARY_PENALTY);
}

function formatHour(hour) {
  return `${String(hour).padStart(2, '0')}:00`;
}

export function selectSubseasonalForecast(payload, weddingDate = WEDDING_DATE) {
  const entry = payload?.properties?.timeseries?.find(entry =>
    osloTime(entry.time).date === weddingDate && entry.data?.next_24_hours?.details);
  const details = entry?.data?.next_24_hours?.details;
  if (!hasDailyForecastDetails(details)) return null;
  return {
    date: weddingDate,
    source: 'subseasonal',
    icon: 'rain',
    description: `${Math.round(details.probability_of_precipitation)}% sjanse for regn`,
    precipitationProbability: details.probability_of_precipitation,
    temperatureMin: details.air_temperature_min,
    temperatureMax: details.air_temperature_max,
    updatedAt: payload.properties.meta?.updated_at ?? null,
  };
}

function hasDailyForecastDetails(details) {
  return details &&
    Number.isFinite(details.air_temperature_min) &&
    Number.isFinite(details.air_temperature_max) &&
    Number.isFinite(details.probability_of_precipitation);
}

export function selectForecast(location, subseasonal, weddingDate = WEDDING_DATE) {
  return selectLocationForecast(location, weddingDate) ??
    selectSubseasonalForecast(subseasonal, weddingDate) ??
    { ...FALLBACK, date: weddingDate };
}
