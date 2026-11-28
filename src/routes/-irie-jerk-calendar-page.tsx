// Shared by src/routes/irie-jerk-and-juggling_.calendar.tsx. Every Thursday's
// city, special night and holiday party, from src/lib/thursday/.
import { useEffect, useState } from "react";
import { CalendarDays, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { venueLine } from "@/lib/thursday/calendar";
import {
  IRIE_JERK_JUGGLING as EVENT,
  IRIE_JERK_JUGGLING_EDITIONS as EDITIONS,
} from "@/lib/thursday/irie-jerk-juggling";
import { currentThursday, longDate, SCHEDULE, specialOn } from "@/lib/thursday/schedule";
import christmasFlyer from "@/assets/irie-jerk-christmas-eve-flyer-560.webp";
import ballFlyer from "@/assets/irie-jerk-winter-ball-flyer-560.webp";

const SITE_URL = "https://trcevent.com";
const PAGE_URL = `${SITE_URL}/irie-jerk-and-juggling/calendar/`;
const TITLE = "Every Thursday’s City | Irie Jerk & Juggling";
const DESCRIPTION =
  "The city, special night and holiday party for each Irie Jerk & Juggling Thursday, from December 3, 2026 through 2027.";

export function irieJerkCalendarHead() {
  return {
    meta: [
      { title: `${TITLE} | TRC Events` },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: PAGE_URL },
      { property: "og:image", content: EVENT.ogImage },
    ],
    links: [{ rel: "canonical", href: PAGE_URL }],
  };
}

type Night = {
  date: string;
  href: string;
  name: string;
  badge?: string;
  note: string;
  image?: string;
};

const HOLIDAY_FLYERS: Record<string, string> = {
  "2026-12-24": christmasFlyer,
  "2026-12-31": ballFlyer,
};

const NIGHTS: Night[] = [
  ...SCHEDULE.map(([date, key]): Night => {
    const edition = EDITIONS.find((e) => e.key === key)!;
    const special = specialOn(date);
    return {
      date,
      href: `/irie-jerk-and-juggling/${key}`,
      name: edition.label,
      badge: special?.title,
      note: special?.description ?? `${EVENT.admission}, ${EVENT.schedule.timeLabel}`,
      image: edition.flyer.srcSet.split(" ")[0],
    };
  }),
  ...EVENT.holidays.map(
    (h): Night => ({
      date: h.date,
      href: h.href,
      name: h.title,
      badge: `Holiday · $${h.price}`,
      note: h.description,
      image: HOLIDAY_FLYERS[h.date],
    }),
  ),
].sort((a, b) => a.date.localeCompare(b.date));

const monthOf = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${iso}T00:00:00Z`),
  );

export function IrieJerkCalendarPage() {
  // Past nights are dimmed once the browser knows today's date.
  const [upcoming, setUpcoming] = useState("");
  useEffect(() => setUpcoming(currentThursday()), []);

  const months = [...new Set(NIGHTS.map((n) => monthOf(n.date)))];

  return (
    <div>
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6">
          <p className="eyebrow mb-3">Irie Jerk &amp; Juggling</p>
          <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-6xl">
            Every Thursday&rsquo;s <span className="text-gradient-gold">City</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            A new city each week. {EVENT.admission}, {EVENT.schedule.timeLabel}, except holiday
            parties.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4 shrink-0 text-gold" /> {EVENT.venue.name}, {venueLine(EVENT)}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild variant="gold">
              <a href="/irie-jerk-and-juggling">This Week</a>
            </Button>
            <Button asChild variant="goldOutline">
              <a href={EVENT.icsHref}>
                <CalendarDays className="size-4" /> Add Thursdays to Calendar
              </a>
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-12 px-4 py-14 sm:px-6">
        {months.map((month) => (
          <section key={month}>
            <h2 className="font-display text-2xl font-bold">{month}</h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {NIGHTS.filter((n) => monthOf(n.date) === month).map((night) => (
                <li key={night.date}>
                  <a
                    href={night.href}
                    className={`flex h-full gap-4 rounded-xl border bg-card p-3 transition-colors hover:border-gold ${
                      night.badge ? "border-gold/60" : "border-border"
                    } ${night.date < upcoming ? "opacity-50" : ""}`}
                  >
                    {night.image && (
                      <img
                        src={night.image}
                        alt=""
                        loading="lazy"
                        width={80}
                        height={100}
                        className="h-[100px] w-20 shrink-0 rounded-md object-cover"
                      />
                    )}
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        {longDate(night.date)}
                      </p>
                      <p className="mt-1 font-display text-lg font-bold">{night.name}</p>
                      {night.badge && (
                        <p className="mt-1 text-xs font-bold uppercase tracking-wide text-gold">
                          {night.badge}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">{night.note}</p>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
