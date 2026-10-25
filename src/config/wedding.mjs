// Change the wedding date here. Display labels and forecast windows are derived below.
export const WEDDING_DATE = '2027-09-04';
export const TIME_ZONE = 'Europe/Oslo';
export const FORECAST_DAYS = 21;
export const LOCATION_FORECAST_DAYS = 10;

export function daysBefore(date, days) {
  const result = new Date(`${date}T12:00:00Z`);
  result.setUTCDate(result.getUTCDate() - days);
  return result.toISOString().slice(0, 10);
}

export const WEATHER_START = daysBefore(WEDDING_DATE, FORECAST_DAYS);
export const WEDDING_DATE_LABEL = new Intl.DateTimeFormat('nb-NO', {
  timeZone: TIME_ZONE, day: 'numeric', month: 'long', year: 'numeric',
}).format(new Date(`${WEDDING_DATE}T12:00:00Z`));

export function isForecastWindow(today, weddingDate = WEDDING_DATE) {
  return today >= daysBefore(weddingDate, FORECAST_DAYS) && today <= weddingDate;
}
