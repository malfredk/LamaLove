import { WEATHER_MESSAGES } from '../config/weather-copy.mjs';
import { RAIN_PROBABILITY_THRESHOLD_PERCENT } from '../config/weather.mjs';

function rainProbability(forecast) {
  // Older saved forecasts stored the probability only in the description.
  const probability = forecast.precipitationProbability ?? Number.parseFloat(forecast.description);
  return Number.isFinite(probability) && probability >= 0 && probability <= 100 ? probability : null;
}

export function weatherIntroduction(forecast) {
  if (!forecast?.source || forecast.source === 'fallback') return WEATHER_MESSAGES.fallback;
  if (forecast.source === 'subseasonal') {
    const probability = rainProbability(forecast);
    if (probability === null) return WEATHER_MESSAGES.other;
    return Math.round(probability) >= RAIN_PROBABILITY_THRESHOLD_PERCENT ? WEATHER_MESSAGES.rain : WEATHER_MESSAGES.notRain;
  }
  if (forecast.icon === 'sun') return WEATHER_MESSAGES.sun;
  if (['rain', 'thunder'].includes(forecast.icon)) return WEATHER_MESSAGES.rain;
  if (['cloud', 'partly-cloudy'].includes(forecast.icon)) return WEATHER_MESSAGES.dry;
  return WEATHER_MESSAGES.other;
}

export function weatherIllustration(forecast) {
  if (!forecast?.source || forecast.source === 'fallback') return 'couple-umbrella';
  if (forecast.source === 'subseasonal') return 'couple-uncertain';
  if (forecast.icon === 'sun') return 'couple-sun';
  if (['cloud', 'partly-cloudy'].includes(forecast.icon)) return 'couple-clouds';
  if (['rain', 'thunder', 'snow'].includes(forecast.icon)) return 'couple-umbrella';
  return 'couple-uncertain';
}

export function weatherRainChance(forecast) {
  if (forecast.source !== 'subseasonal') return null;
  const probability = rainProbability(forecast);
  return probability === null ? null : `${Math.round(probability)}% sjanse for regn`;
}

export function weatherTemperature(forecast) {
  const formatTemperature = value => `${Math.round(value)}°`;
  if (Number.isFinite(forecast.temperature)) return formatTemperature(forecast.temperature);
  if (!Number.isFinite(forecast.temperatureMin) || !Number.isFinite(forecast.temperatureMax)) return null;
  if (forecast.temperatureMin > forecast.temperatureMax) return null;
  return `${formatTemperature(forecast.temperatureMin)} til ${formatTemperature(forecast.temperatureMax)}`;
}
