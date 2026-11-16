import { WEDDING_DATE, TIME_ZONE } from '../../../common/config/wedding.mjs';

const weddingDayLabel = new Intl.DateTimeFormat('nb-NO', {
  timeZone: TIME_ZONE, day: 'numeric', month: 'long',
}).format(new Date(`${WEDDING_DATE}T12:00:00Z`));
const weddingMonthLabel = new Intl.DateTimeFormat('nb-NO', {
  timeZone: TIME_ZONE, month: 'long',
}).format(new Date(`${WEDDING_DATE}T12:00:00Z`));

// Edit the weather introduction texts here.
export const WEATHER_MESSAGES = {
  fallback: `Når man gifter seg i Bergen i ${weddingMonthLabel}, er det gode sjanser for regn og dermed et lykkelig ekteskap. Mer presis værmelding kommer når det nærmer seg.`,
  dry: `Det er meldt opplett ${weddingDayLabel}. Dette regnes som fint vær i Bergen!`,
  sun: `Det er meldt sol i Bergen ${weddingDayLabel}!`,
  rain: 'Værmeldingen tilsier at det blir regn på bryllupsdagen, og dermed et lykkelig ekteskap.',
  notRain: 'Enn så lenge er det ikke meldt regn. Vi krysser fingrene for opplett!',
  other: 'Uansett vær gleder vi oss til å feire dagen sammen med dere!',
};
