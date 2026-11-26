// Calendar links, structured data and labels for a weekly Thursday event.
// Pure functions of the ThursdayEvent data, so every edition stays in sync.
import type { ResponsiveImage, ThursdayEvent } from "./types";

const SITE_URL = "https://trcevent.com";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function pageUrl(event: ThursdayEvent): string {
  // Trailing slash: GitHub Pages serves each page at /slug/ and redirects /slug there.
  return `${SITE_URL}/${event.slug}/`;
}

/** "Every Thursday from Dec 3": stays true after launch, unlike "Starts Dec 3". */
export function startsLabel(event: ThursdayEvent): string {
  const [, m, d] = event.schedule.startDate.split("-").map(Number);
  return `Every Thursday from ${MONTHS[m - 1]} ${d}`;
}

export function venueLine(event: ThursdayEvent): string {
  const v = event.venue;
  return `${v.street}, ${v.city}, ${v.region} ${v.postalCode}`;
}

/** Builds a srcset image from a small and a large web copy of the same picture. */
export function responsiveImage(opts: {
  small: string;
  smallWidth: number;
  large: string;
  largeWidth: number;
  height: number;
  sizes: string;
  alt: string;
}): ResponsiveImage {
  return {
    src: opts.large,
    srcSet: `${opts.small} ${opts.smallWidth}w, ${opts.large} ${opts.largeWidth}w`,
    sizes: opts.sizes,
    width: opts.largeWidth,
    height: opts.height,
    alt: opts.alt,
  };
}

const compact = (date: string, time: string) =>
  `${date.replace(/-/g, "")}T${time.replace(":", "")}00`;

/** Google Calendar "add event" link for the weekly series. */
export function googleCalendarUrl(event: ThursdayEvent): string {
  const s = event.schedule;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${event.name.join(" ")} (${event.admission.toLowerCase()})`,
    dates: `${compact(s.startDate, s.startTime)}/${compact(s.startDate, s.endTime)}`,
    ctz: s.timeZone,
    recur: "RRULE:FREQ=WEEKLY;BYDAY=TH",
    location: `${event.venue.name}, ${venueLine(event)}`,
    details: `${event.description} ${pageUrl(event)}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** ISO dates of holiday nights that replace the regular weekly night. */
export function skippedDates(event: ThursdayEvent): string[] {
  return event.holidays.filter((h) => h.replacesWeekly).map((h) => h.date);
}

/**
 * The .ics file body for the weekly series (written to public/ by a script).
 * `generatedAt` becomes DTSTAMP, which must be when the file was made, not a future date.
 */
export function icsFile(event: ThursdayEvent, generatedAt: Date = new Date()): string {
  const s = event.schedule;
  const stamp = generatedAt
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
  const skipped = skippedDates(event);
  const esc = (t: string) => t.replace(/[\\;,]/g, (c) => `\\${c}`);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TRC Events//Thursday nights//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VTIMEZONE",
    "TZID:America/Chicago",
    "BEGIN:DAYLIGHT",
    "TZOFFSETFROM:-0600",
    "TZOFFSETTO:-0500",
    "TZNAME:CDT",
    "DTSTART:19700308T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU",
    "END:DAYLIGHT",
    "BEGIN:STANDARD",
    "TZOFFSETFROM:-0500",
    "TZOFFSETTO:-0600",
    "TZNAME:CST",
    "DTSTART:19701101T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU",
    "END:STANDARD",
    "END:VTIMEZONE",
    "BEGIN:VEVENT",
    `UID:${event.slug}-thursdays@trcevent.com`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=${s.timeZone}:${compact(s.startDate, s.startTime)}`,
    `DTEND;TZID=${s.timeZone}:${compact(s.startDate, s.endTime)}`,
    "RRULE:FREQ=WEEKLY;BYDAY=TH",
    ...(skipped.length
      ? [`EXDATE;TZID=${s.timeZone}:${skipped.map((d) => compact(d, s.startTime)).join(",")}`]
      : []),
    `SUMMARY:${esc(`${event.name.join(" ")} (${event.admission.toLowerCase()})`)}`,
    `LOCATION:${esc(`${event.venue.name}, ${venueLine(event)}`)}`,
    `DESCRIPTION:${esc(event.description)}`,
    `URL:${pageUrl(event)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .map(foldIcsLine)
    .join("\r\n")
    .concat("\r\n");
}

/** RFC 5545 line folding: at most 75 characters per line; continuation lines start with a space. */
function foldIcsLine(line: string): string {
  if (line.length <= 75) return line;
  const parts = [line.slice(0, 75)];
  for (let i = 75; i < line.length; i += 74) parts.push(line.slice(i, i + 74));
  return parts.join("\r\n ");
}

/** schema.org Event data: the weekly series plus each holiday night. */
export function eventJsonLd(event: ThursdayEvent, flyer: ResponsiveImage) {
  const s = event.schedule;
  const place = {
    "@type": "Place",
    name: event.venue.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: event.venue.street,
      addressLocality: event.venue.city,
      addressRegion: event.venue.region,
      postalCode: event.venue.postalCode,
      addressCountry: "US",
    },
    telephone: event.venue.phone.tel,
  };
  const organizer = { "@type": "Organization", name: event.presenter };
  const name = event.name.join(" ");
  const flyerUrl = flyer.src.startsWith("http") ? flyer.src : `${SITE_URL}${flyer.src}`;
  return [
    {
      "@context": "https://schema.org",
      "@type": "Event",
      name,
      description: event.description,
      url: pageUrl(event),
      image: [event.ogImage, flyerUrl],
      startDate: `${s.startDate}T${s.startTime}:00${s.utcOffset}`,
      endDate: `${s.startDate}T${s.endTime}:00${s.utcOffset}`,
      eventSchedule: {
        "@type": "Schedule",
        repeatFrequency: "P1W",
        byDay: "https://schema.org/Thursday",
        startDate: s.startDate,
        startTime: `${s.startTime}:00`,
        endTime: `${s.endTime}:00`,
        scheduleTimezone: s.timeZone,
        ...(skippedDates(event).length ? { exceptDate: skippedDates(event) } : {}),
      },
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      isAccessibleForFree: true,
      location: place,
      organizer,
      offers: {
        "@type": "Offer",
        price: 0,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: pageUrl(event),
      },
    },
    ...event.holidays.map((h) => ({
      "@context": "https://schema.org",
      "@type": "Event",
      name: h.title,
      description: h.description,
      url: pageUrl(event),
      image: [event.ogImage],
      startDate: h.date,
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: place,
      organizer,
      offers: { "@type": "Offer", price: h.price, priceCurrency: "USD", url: pageUrl(event) },
    })),
  ];
}
