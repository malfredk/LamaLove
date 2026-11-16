// Change the wedding date here. Features derive their date labels and windows from it.
export const WEDDING_DATE = '2027-09-04';
export const TIME_ZONE = 'Europe/Oslo';
export const WEDDING_DATE_LABEL = new Intl.DateTimeFormat('nb-NO', {
  timeZone: TIME_ZONE, day: 'numeric', month: 'long', year: 'numeric',
}).format(new Date(`${WEDDING_DATE}T12:00:00Z`));
