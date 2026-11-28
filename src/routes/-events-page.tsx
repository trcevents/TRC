// Shared by src/routes/events.tsx. The "-" prefix excludes this file from
// route generation (TanStack Router convention) — see src/routes/README.md.
//
// A dedicated landing page for the nav's "Events" link: just the full Irie
// Jerk weekly lineup grid (see IrieJerkLineupGrid), without Dinner in
// Jamaica's dinner-specific narrative/hero/notify-me signup. That page still
// carries its own hook and Culture Card story around Sunday's food; this one
// is the plain "what's on, every day" index.
import { useEffect, useState } from "react";
import { CalendarDays, Phone, UtensilsCrossed } from "lucide-react";
import { IrieJerkLineupGrid } from "@/components/site/IrieJerkLineupGrid";
import { venueLine } from "@/lib/thursday/calendar";
import { IRIE_JERK_JUGGLING } from "@/lib/thursday/irie-jerk-juggling-event";
import ijjFlyer from "@/assets/irie-jerk-juggling-flyer-560.webp";
import christmasFlyer from "@/assets/irie-jerk-christmas-eve-flyer-560.webp";
import ballFlyer from "@/assets/irie-jerk-winter-ball-flyer-560.webp";
import { currentThursday } from "@/lib/thursday/schedule";
import limeFlyer from "@/assets/friday-lime-flags-560.webp";
import irieJerkLogo from "@/assets/irie-jerk-logo-720.webp";
import { FRIDAY_LIME } from "@/lib/friday-lime";

const SITE_URL = "https://trcevent.com";

export function eventsHead() {
  return {
    meta: [
      { title: "Events at Irie Jerk | TRC Events" },
      {
        name: "description",
        content:
          "Every event at Irie Jerk Bar and Grill, day by day — a different vibe every night, 100% alcohol-free. Presented by TRC Events.",
      },
      { property: "og:title", content: "Events at Irie Jerk | TRC Events" },
      {
        property: "og:description",
        content: "Every event at Irie Jerk Bar and Grill, day by day — a different vibe every night.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/events/` },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Events at Irie Jerk | TRC Events" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/events/` }],
  };
}

const HOLIDAY_FLYERS: Record<string, string> = {
  "2026-12-24": christmasFlyer,
  "2026-12-31": ballFlyer,
};

export function EventsPage() {
  // Parties that have passed drop off once the browser knows today's date.
  const [from, setFrom] = useState("");
  useEffect(() => setFrom(currentThursday()), []);
  const holidays = IRIE_JERK_JUGGLING.holidays.filter((h) => h.date >= from);

  return (
    <div>
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <p className="eyebrow mb-3">Presented by TRC Events</p>
          <h1 className="font-display text-5xl font-extrabold tracking-tight sm:text-6xl">
            Events at <span className="text-gradient-gold">Irie Jerk</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            A different vibe every day and night — 100% alcohol-free.
          </p>
          <div className="mx-auto mt-6 flex max-w-xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4 text-gold" /> 7 days a week
            </span>
            <span className="inline-flex items-center gap-1.5">
              <UtensilsCrossed className="size-4 text-gold" /> {IRIE_JERK_JUGGLING.venue.name},{" "}
              {venueLine(IRIE_JERK_JUGGLING)}
            </span>
            <a
              href={`tel:${IRIE_JERK_JUGGLING.venue.phone.tel}`}
              className="inline-flex items-center gap-1.5 hover:text-gold"
            >
              <Phone className="size-4 text-gold" /> {IRIE_JERK_JUGGLING.venue.phone.display}
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <a
          href="/lunch"
          className="mb-6 flex flex-col items-center justify-between gap-3 rounded-xl border-2 border-gold bg-gold/10 p-6 text-center sm:flex-row sm:text-left"
        >
          <div>
            <p className="eyebrow mb-2">Lunch · 7 days a week · 11 AM – 3 PM</p>
            <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
              <img
                src={irieJerkLogo}
                width={720}
                height={114}
                alt="Irie Jerk Bar and Grill"
                className="mx-auto mb-1 h-auto w-full max-w-xs sm:mx-0"
              />
              <span className="text-gradient-gold">Jerk Bowl</span>
            </h2>
            <p className="mt-2 text-muted-foreground">Bowls $20, seafood $25.</p>
          </div>
          <span className="shrink-0 text-sm font-medium text-gold">See the lunch menu →</span>
        </a>

        <a
          href="/irie-jerk-and-juggling"
          className="mb-6 flex flex-col items-center gap-6 rounded-xl border border-gold/40 bg-card p-6 transition-colors hover:border-gold sm:flex-row"
        >
          <img
            src={ijjFlyer}
            alt="Irie Jerk & Juggling flyer"
            className="w-40 shrink-0 rounded-lg border border-gold/30"
          />
          <div className="text-center sm:text-left">
            <p className="eyebrow mb-2">Featured · Every Thursday from Dec 3</p>
            <h2 className="font-display text-3xl font-extrabold">
              Irie Jerk <span className="text-gradient-gold">&amp; Juggling</span>
            </h2>
            <p className="mt-2 text-muted-foreground">
              Free Thursday dancehall party, 5–9 PM, with Jamaican cooking from Irie Jerk in
              Calumet Park.
            </p>
            <span className="mt-3 inline-block text-sm font-medium text-gold">
              See the event →
            </span>
          </div>
        </a>

        {holidays.length > 0 && (
          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            {holidays.map((h) => (
              <a
                key={h.date}
                href={h.href}
                className="flex items-center gap-4 rounded-xl border border-gold/40 bg-card p-4 transition-colors hover:border-gold"
              >
                <img
                  src={HOLIDAY_FLYERS[h.date]}
                  alt={`${h.title} flyer`}
                  className="w-28 shrink-0 rounded-lg border border-gold/30"
                />
                <div>
                  <p className="eyebrow mb-2">{h.dateLabel}</p>
                  <h2 className="font-display text-xl font-extrabold">{h.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">${h.price} admission</p>
                  <span className="mt-2 inline-block text-sm font-medium text-gold">
                    See the night →
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}

        <a
          href={FRIDAY_LIME.path}
          className="mb-12 flex flex-col items-center gap-6 rounded-xl border border-lime/40 bg-card p-6 transition-colors hover:border-lime sm:flex-row"
        >
          <img
            src={limeFlyer}
            alt="The Ultimate Friday Lime flyer"
            className="w-40 shrink-0 rounded-lg border border-lime/30"
          />
          <div className="text-center sm:text-left">
            <p className="eyebrow mb-2">Every Friday</p>
            <h2 className="font-display text-3xl font-extrabold">
              The Ultimate Friday <span className="text-lime">Lime</span>
            </h2>
            <p className="mt-2 text-muted-foreground">
              Jamaican dinners and DJs playing soca, dancehall, reggae, Afrobeats, amapiano and
              neo-soul. {FRIDAY_LIME.coverLabel}.
            </p>
            <span className="mt-3 inline-block text-sm font-medium text-lime">
              See the event →
            </span>
          </div>
        </a>

        <IrieJerkLineupGrid />

        <p className="mt-14 text-center text-sm text-muted-foreground">
          Curious about the story behind Sunday's food?{" "}
          <a href="/dinner-in-jamaica" className="font-medium text-gold hover:underline">
            Read about the Dinner Riddim
          </a>
          . Presented by TRC Events, at{" "}
          <a
            href="/irie-jerk-and-juggling"
            className="font-medium text-foreground hover:text-gold hover:underline"
          >
            Irie Jerk
          </a>
          .
        </p>
      </div>
    </div>
  );
}
