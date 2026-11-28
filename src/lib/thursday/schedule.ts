// Which city design each Irie Jerk & Juggling Thursday uses, and the special
// nights. No asset imports, so vite.config.ts can read it too.
//
// To change a week, edit the key beside its date. Dec 24 and Dec 31, 2026 are
// holiday parties (irie-jerk-juggling-event.ts), so they have no city.

/** [Thursday (ISO date), edition key], in date order. */
export const SCHEDULE: readonly (readonly [string, string])[] = [
  ["2026-12-03", "tokyo"],
  ["2026-12-10", "copenhagen"],
  ["2026-12-17", "seoul"],
  ["2027-01-07", "bristol"],
  ["2027-01-14", "moscow"],
  ["2027-01-21", "stockholm"],
  ["2027-01-28", "accra"],
  ["2027-02-04", "lagos"],
  ["2027-02-11", "belize-city"],
  ["2027-02-18", "dakar"],
  ["2027-02-25", "paris"],
  ["2027-03-04", "nairobi"],
  ["2027-03-11", "havana"],
  ["2027-03-18", "berlin"],
  ["2027-03-25", "zanzibar"],
  ["2027-04-01", "osaka"],
  ["2027-04-08", "lisbon"],
  ["2027-04-15", "marseille"],
  ["2027-04-22", "georgetown"],
  ["2027-04-29", "sao-luis"],
  ["2027-05-06", "panama-city"],
  ["2027-05-13", "johannesburg"],
  ["2027-05-20", "singapore"],
  ["2027-05-27", "curacao"],
  ["2027-06-03", "bridgetown"],
  ["2027-06-10", "okinawa"],
  ["2027-06-17", "koh-phangan"],
  ["2027-06-24", "fiji"],
  ["2027-07-01", "kingston"],
  ["2027-07-08", "bali"],
  ["2027-07-15", "yokohama"],
  ["2027-07-22", "manila"],
  ["2027-07-29", "benicassim"],
  ["2027-08-05", "auckland"],
  ["2027-08-12", "sydney"],
  ["2027-08-19", "cape-town"],
  ["2027-08-26", "rotterdam"],
  ["2027-09-02", "taipei"],
  ["2027-09-09", "santiago"],
  ["2027-09-16", "mexico-city"],
  ["2027-09-23", "lima"],
  ["2027-09-30", "buenos-aires"],
  ["2027-10-07", "colombo"],
  ["2027-10-14", "new-delhi"],
  ["2027-10-21", "melbourne"],
  ["2027-10-28", "mauritius"],
  ["2027-11-04", "abidjan"],
  ["2027-11-11", "bogota"],
  ["2027-11-18", "santo-domingo"],
  ["2027-11-25", "paramaribo"],
  ["2027-12-02", "kathmandu"],
  // Encores close out the year.
  ["2027-12-09", "tokyo"],
  ["2027-12-16", "copenhagen"],
  ["2027-12-23", "seoul"],
  ["2027-12-30", "moscow"],
];

export type SpecialNight = { date: string; title: string; description: string };

/** Themed 2027 Thursdays (confirmed by the owner, 2026-11-28). Same free night, 5–9 PM. */
export const SPECIAL_NIGHTS: readonly SpecialNight[] = [
  {
    date: "2027-01-07",
    title: "Kartel Birthday Salute",
    description: "A DJ tribute set built around familiar Vybz Kartel hooks. The artist does not appear.",
  },
  {
    date: "2027-04-01",
    title: "No Joke Dancehall",
    description: "The DJ teases a familiar intro, switches the riddim, then drops the chorus you were waiting for.",
  },
  {
    date: "2027-04-15",
    title: "World Art Day",
    description: "Local art meets a dancehall set.",
  },
  {
    date: "2027-04-22",
    title: "Earth Day",
    description: "A food-first night centered on herbs and spices.",
  },
  {
    date: "2027-04-29",
    title: "International Dance Day",
    description: "Learn an easy dancehall step, then let the DJ turn it into a party.",
  },
  {
    date: "2027-07-01",
    title: "International Reggae Day",
    description: "Roots and reggae favorites build into dancehall, and the room carries the closing chorus.",
  },
  {
    date: "2027-07-15",
    title: "Buju Birthday Salute",
    description: "A selector-led tribute set spanning Buju Banton’s dancehall and roots. The artist does not appear.",
  },
  {
    date: "2027-09-16",
    title: "Mexican Independence Day",
    description: "A Mexican and Caribbean crossover night.",
  },
  {
    date: "2027-10-28",
    title: "International Creole Day",
    description: "A Caribbean Creole crossover night.",
  },
];

const DAY_MS = 86_400_000;

const toUtc = (iso: string) => Date.parse(`${iso}T00:00:00Z`);

/**
 * The Thursday the page is about: today if it's a Thursday before 9 PM in
 * Chicago, otherwise the next one. Never earlier than the first night.
 */
export function currentThursday(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  let day = Date.UTC(get("year"), get("month") - 1, get("day"));
  if (new Date(day).getUTCDay() === 4 && get("hour") >= 21) day += DAY_MS;
  day += ((4 - new Date(day).getUTCDay() + 7) % 7) * DAY_MS;
  return new Date(Math.max(day, toUtc(SCHEDULE[0][0]))).toISOString().slice(0, 10);
}

/**
 * The design for a Thursday. A holiday week borrows the next scheduled city;
 * after the last scheduled date the list starts over.
 */
export function editionKeyFor(date: string): string {
  const next = SCHEDULE.find(([d]) => d >= date);
  if (next) return next[1];
  const weeks = Math.round((toUtc(date) - toUtc(SCHEDULE[SCHEDULE.length - 1][0])) / (7 * DAY_MS));
  return SCHEDULE[(weeks - 1) % SCHEDULE.length][1];
}

/** The first Thursday a design is scheduled. */
export function firstDateFor(key: string): string | undefined {
  return SCHEDULE.find(([, k]) => k === key)?.[0];
}

export const specialOn = (date: string) => SPECIAL_NIGHTS.find((s) => s.date === date);

/** "Thursday, December 3, 2026" */
export function longDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(toUtc(iso)));
}
