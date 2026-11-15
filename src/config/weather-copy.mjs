import { WEDDING_DAY_LABEL, WEDDING_MONTH_LABEL } from './wedding.mjs';

// Edit the weather introduction texts here.
export const WEATHER_MESSAGES = {
  fallback: `Når man gifter seg i Bergen i ${WEDDING_MONTH_LABEL}, er det gode sjanser for regn og dermed et lykkelig ekteskap. Mer presis værmelding kommer når det nærmer seg.`,
  dry: `Det er meldt opplett ${WEDDING_DAY_LABEL}. Dette regnes som fint vær i Bergen!`,
  sun: `Det er meldt sol i Bergen ${WEDDING_DAY_LABEL}!`,
  rain: 'Værmeldingen tilsier at det blir regn på bryllupsdagen, og dermed et lykkelig ekteskap.',
  notRain: 'Enn så lenge er det ikke meldt regn. Vi krysser fingrene for opplett!',
  other: 'Uansett vær gleder vi oss til å feire dagen sammen med dere!',
};
