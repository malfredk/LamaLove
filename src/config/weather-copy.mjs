// Edit the weather introduction texts here.
export const WEATHER_MESSAGES = {
  fallback: 'Når man gifter seg i Bergen i september, er det gode sjanser for regn og dermed et lykkelig ekteskap. Mer presis værmelding kommer når det nærmer seg.',
  dry: 'Det er meldt opplett 4. september. Dette regnes som fint vær i Bergen!',
  sun: 'Det er meldt sol i Bergen 4. september!',
  rain: 'Værmeldingen tilsier at det blir regn på bryllupsdagen, og dermed et lykkelig ekteskap.',
  notRain: 'Enn så lenge er det ikke meldt regn. Vi krysser fingrene for opplett!',
  other: 'Uansett vær gleder vi oss til å feire dagen sammen med dere!',
};

export function weatherIntroduction(forecast) {
  if (!forecast || forecast.source === 'fallback' || !forecast.source) return WEATHER_MESSAGES.fallback;
  if (forecast.source === 'subseasonal') {
    // Long-range data has rain probability, but cannot tell us whether it will be sunny.
    // Support saved forecasts from before the numeric probability field was added.
    const probability = forecast.precipitationProbability ?? Number.parseFloat(forecast.description);
    if (!Number.isFinite(probability)) return WEATHER_MESSAGES.other;
    return probability >= 50 ? WEATHER_MESSAGES.rain : WEATHER_MESSAGES.notRain;
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
