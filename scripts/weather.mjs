import { WEDDING_DATE, TIME_ZONE } from '../src/config/wedding.mjs';
export const FALLBACK = {
  date: WEDDING_DATE,
  source: 'fallback',
  icon: 'rain',
  description: '',
};

const localParts = new Intl.DateTimeFormat('sv-SE', {
  timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', hourCycle: 'h23',
});

export function osloTime(timestamp) {
  const parts = Object.fromEntries(localParts.formatToParts(new Date(timestamp)).map(p => [p.type, p.value]));
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
  const candidates = [];
  for (const entry of payload?.properties?.timeseries ?? []) {
    const start = osloTime(entry.time);
    const temperature = entry.data?.instant?.details?.air_temperature;
    if (start.date !== weddingDate || !Number.isFinite(temperature)) continue;
    // Prefer an actual six-hour afternoon summary, then hourly summaries.
    for (const hours of [6, 1]) {
      const period = entry.data?.[`next_${hours}_hours`];
      const code = period?.summary?.symbol_code;
      const end = osloTime(new Date(Date.parse(entry.time) + hours * 3600000));
      if (!code || start.hour < 12 || start.hour >= 18 || end.date !== weddingDate) continue;
      candidates.push({ entry, start, end, hours, code, temperature,
        score: Math.abs(start.hour + hours / 2 - 15) + (hours === 6 ? 0 : 0.25) });
    }
  }
  candidates.sort((a, b) => a.score - b.score);
  const selected = candidates[0];
  if (!selected) return null;
  return {
    date: weddingDate, source: 'locationforecast',
    ...weatherSymbol(selected.code),
    temperature: selected.temperature,
    period: `${String(selected.start.hour).padStart(2, '0')}:00–${String(selected.end.hour).padStart(2, '0')}:00`,
    updatedAt: payload.properties.meta?.updated_at ?? null,
  };
}

export function selectSubseasonalForecast(payload, weddingDate = WEDDING_DATE) {
  const entry = payload?.properties?.timeseries?.find(entry =>
    osloTime(entry.time).date === weddingDate && entry.data?.next_24_hours?.details);
  const details = entry?.data?.next_24_hours?.details;
  if (!details || !Number.isFinite(details.air_temperature_min) ||
      !Number.isFinite(details.air_temperature_max) || !Number.isFinite(details.probability_of_precipitation)) return null;
  return {
    date: weddingDate, source: 'subseasonal', icon: 'rain',
    description: `${Math.round(details.probability_of_precipitation)}% sjanse for regn`,
    temperatureMin: details.air_temperature_min,
    temperatureMax: details.air_temperature_max,
    updatedAt: payload.properties.meta?.updated_at ?? null,
  };
}

export function selectForecast(location, subseasonal, weddingDate = WEDDING_DATE) {
  return selectLocationForecast(location, weddingDate) ?? selectSubseasonalForecast(subseasonal, weddingDate) ?? { ...FALLBACK, date: weddingDate };
}
