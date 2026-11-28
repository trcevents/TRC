// The two holiday parties, each on its own page. Date, price and title come from
// irie-jerk-juggling-event.ts; the copy follows the owner's flyers. No start time
// has been given.
import { CalendarDays, MapPin, Phone, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { venueLine } from "@/lib/thursday/calendar";
import { IRIE_JERK_JUGGLING as EVENT } from "@/lib/thursday/irie-jerk-juggling-event";
import christmasSmall from "@/assets/irie-jerk-christmas-eve-flyer-560.webp";
import christmasLarge from "@/assets/irie-jerk-christmas-eve-flyer-1024.webp";
import ballSmall from "@/assets/irie-jerk-winter-ball-flyer-560.webp";
import ballLarge from "@/assets/irie-jerk-winter-ball-flyer-1024.webp";

const SITE_URL = "https://trcevent.com";

const NIGHTS = {
  "christmas-eve": {
    date: "2026-12-24",
    eyebrow: "Irie Jerk & Juggling",
    intro:
      "Step in from the cold on 127th Street. There’s a plate coming out of the Jamaican kitchen, and the DJ is already playing something you know.",
    flyer: { small: christmasSmall, large: christmasLarge, height: 1280 },
    alt: "Christmas Eve flyer: Thursday, December 24, 2026, $20 admission, dancehall and Jamaican cooking at Irie Jerk Bar and Grill",
    sections: [
      {
        heading: "Come in hungry.",
        body: "Start at the table with food from Irie Jerk’s Jamaican kitchen. Catch up with your people over a plate while the DJ takes the room from one familiar riddim to the next.",
      },
      {
        heading: "Sing it back.",
        body: "An evening dance party with dancehall up front. When the DJ turns down a tune you know and calls for voices, the room finishes the hook.",
      },
    ],
  },
  "winter-ball": {
    date: "2026-12-31",
    eyebrow: "New Year’s Eve",
    intro: "A red-carpet New Year’s Eve on 127th Street. Dress for the cameras, stay for the runway and dance into 2027.",
    flyer: { small: ballSmall, large: ballLarge, height: 1536 },
    alt: "GQ Meets VOGUE Winter Ball flyer: Thursday, December 31, 2026, red carpet, formal attire and Best Dressed runway at Irie Jerk Bar and Grill",
    sections: [
      { heading: "The red carpet", body: "Red carpet and professional photography." },
      {
        heading: "Dinner with strings",
        body: "A string quartet at dinner, with classic reggae and Afrobeats remixes.",
      },
      {
        heading: "Best Dressed runway",
        body: "Most Fashion Forward Male and Most Elegant Female, judged by local designers and fashion influencers.",
      },
      { heading: "Ring in 2027", body: "The after-midnight party." },
      { heading: "Strict formal attire", body: "Tailored suits and avant-garde gowns." },
    ],
  },
} as const;

export type HolidayKey = keyof typeof NIGHTS;

function facts(key: HolidayKey) {
  const night = NIGHTS[key];
  const holiday = EVENT.holidays.find((h) => h.date === night.date)!;
  return { night, holiday };
}

export function irieJerkHolidayHead(key: HolidayKey) {
  const { holiday } = facts(key);
  const url = `${SITE_URL}/irie-jerk-and-juggling/${key}/`;
  const title = `${holiday.title} | ${holiday.dateLabel}`;
  const description = `${holiday.title} at ${EVENT.venue.name}, Calumet Park. ${holiday.dateLabel}, $${holiday.price} admission.`;
  const image = `${SITE_URL}/og-thursdays/${key}.jpg`;
  return {
    meta: [
      { title: `${title} | TRC Events` },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:image", content: image },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: image },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

export function IrieJerkHolidayPage({ night: key }: { night: HolidayKey }) {
  const { night, holiday } = facts(key);
  const v = EVENT.venue;
  return (
    <div>
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 md:grid-cols-2">
          <div className="text-center md:text-left">
            <p className="eyebrow mb-3">
              {EVENT.presenter} presents · {night.eyebrow}
            </p>
            <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-6xl">
              {holiday.title}
            </h1>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground md:mx-0">{night.intro}</p>
            <ul className="mt-6 flex flex-col items-center gap-2 text-sm md:items-start">
              <li className="inline-flex items-center gap-2">
                <CalendarDays className="size-4 shrink-0 text-gold" /> {holiday.dateLabel}
              </li>
              <li className="inline-flex items-center gap-2">
                <Ticket className="size-4 shrink-0 text-gold" /> ${holiday.price} admission
              </li>
              <li className="inline-flex items-center gap-2">
                <MapPin className="size-4 shrink-0 text-gold" /> {v.name}, {venueLine(EVENT)}
              </li>
            </ul>
            <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
              <Button asChild variant="gold" size="xl">
                <a href={v.mapsUrl} target="_blank" rel="noreferrer">
                  <MapPin className="size-4" /> Get Directions
                </a>
              </Button>
              <Button asChild variant="goldOutline" size="xl">
                <a href={`tel:${v.phone.tel}`}>
                  <Phone className="size-4" /> {v.phone.display}
                </a>
              </Button>
            </div>
          </div>
          <img
            src={night.flyer.large}
            srcSet={`${night.flyer.small} 560w, ${night.flyer.large} 1024w`}
            sizes="(min-width: 768px) 460px, 92vw"
            width={1024}
            height={night.flyer.height}
            alt={night.alt}
            fetchPriority="high"
            className="mx-auto h-auto w-full max-w-[460px] rounded-2xl border border-gold/30"
          />
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {night.sections.map((s) => (
            <div key={s.heading} className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-display text-xl font-bold">{s.heading}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 text-center text-sm">
          <a href="/irie-jerk-and-juggling/calendar" className="font-medium text-gold hover:underline">
            Every Thursday at Irie Jerk →
          </a>
        </p>
      </div>
    </div>
  );
}
