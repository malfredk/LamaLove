// Edit the weather introduction texts here.
export const WEATHER_MESSAGES = {
  fallback: 'Når man gifter seg i Bergen i september, er det gode sjanser for regn og dermed et lykkelig ekteskap.',
  dry: 'Opplett er fint vær i Bergen!',
  sun: 'Sol i Bergen!',
  rain: 'Det skulle bare mangle at det ikke regner i Bergen!',
  notRain: 'Vi krysser fingrene for opplett!',
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
