// Shared by src/routes/friday-lime.tsx. The "-" prefix excludes this file from
// route generation (TanStack Router convention) — see src/routes/README.md.
import {
  CalendarDays,
  MapPin,
  Music,
  Phone,
  Ticket,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FRIDAY_LIME } from "@/lib/friday-lime";
import { venueLine } from "@/lib/thursday/calendar";
import { IRIE_JERK_JUGGLING } from "@/lib/thursday/irie-jerk-juggling-event";
import flagsSmall from "@/assets/friday-lime-flags-560.webp";
import flagsLarge from "@/assets/friday-lime-flags-1122.webp";
import loungeSmall from "@/assets/friday-lime-lounge-560.webp";
import loungeLarge from "@/assets/friday-lime-lounge-1122.webp";
import dancehallSmall from "@/assets/friday-lime-dancehall-560.webp";
import dancehallLarge from "@/assets/friday-lime-dancehall-1122.webp";

const SITE_URL = "https://trcevent.com";
const PAGE_URL = `${SITE_URL}${FRIDAY_LIME.path}/`;
const OG_IMAGE = `${SITE_URL}/og-friday-lime.jpg`;
const TITLE = "The Ultimate Friday Lime | Fridays in Calumet Park";

// Same venue for every Irie Jerk night.
const VENUE = IRIE_JERK_JUGGLING.venue;
const ADDRESS = venueLine(IRIE_JERK_JUGGLING);

const HERO_FLYER = {
  small: flagsSmall,
  large: flagsLarge,
  height: 1402,
  alt: "The Ultimate Friday Lime flyer with Caribbean flags: $20 after midnight, Jamaican dinners available all night, at Irie Jerk Bar and Grill",
};

const MORE_FLYERS = [
  {
    small: loungeSmall,
    large: loungeLarge,
    height: 1402,
    alt: "The Ultimate Friday Lime flyer showing dancers and diners with the Chicago skyline behind them",
  },
  {
    small: dancehallSmall,
    large: dancehallLarge,
    height: 1374,
    alt: "The Ultimate Friday Lime flyer, Dancehall Party Meets Rude Bwoy",
  },
];

export function fridayLimeHead() {
  return {
    meta: [
      { title: "The Ultimate Friday Lime | Irie Jerk, Calumet Park | TRC Events" },
      { name: "description", content: FRIDAY_LIME.description },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: FRIDAY_LIME.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: PAGE_URL },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Three flyers for The Ultimate Friday Lime." },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: FRIDAY_LIME.description },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: PAGE_URL }],
  };
}

export function FridayLimePage() {
  const mapsSrc = `https://www.google.com/maps?q=${encodeURIComponent(
    `${VENUE.name}, ${ADDRESS}`,
  )}&output=embed`;

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-lime/20 bg-lime-deep">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 md:grid-cols-2">
          <div className="text-center md:text-left">
            <p className="eyebrow mb-3">{FRIDAY_LIME.presenter} presents</p>
            <h1 className="font-display font-extrabold tracking-tight">
              <span className="block text-lg uppercase tracking-[0.35em] text-foreground/80 sm:text-xl">
                The Ultimate
              </span>
              <span className="mt-2 block text-5xl sm:text-7xl">
                Friday <span className="italic text-lime">Lime</span>
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground md:mx-0">
              Every Friday at Irie Jerk: Jamaican dinners, DJs and a late-night lime.
            </p>

            <p className="mt-6 inline-block rounded-full border-2 border-lime px-6 py-2 font-display text-2xl font-extrabold text-lime sm:text-3xl">
              {FRIDAY_LIME.coverLabel}
            </p>

            <ul className="mx-auto mt-6 flex max-w-md flex-col items-center gap-2 text-sm text-muted-foreground md:mx-0 md:items-start">
              <li className="inline-flex items-center gap-2">
                <CalendarDays className="size-4 shrink-0 text-lime" /> Every Friday
              </li>
              <li className="inline-flex items-center gap-2">
                <UtensilsCrossed className="size-4 shrink-0 text-lime" /> Food from{" "}
                {FRIDAY_LIME.foodFrom}
              </li>
              <li className="inline-flex items-center gap-2">
                <MapPin className="size-4 shrink-0 text-lime" /> {VENUE.name}, Calumet Park
              </li>
            </ul>

            <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
              <Button asChild variant="gold" size="xl">
                <a href={VENUE.mapsUrl} target="_blank" rel="noreferrer">
                  <MapPin className="size-4" /> Get Directions
                </a>
              </Button>
              <Button asChild variant="goldOutline" size="xl">
                <a href={`tel:${VENUE.phone.tel}`}>
                  <Phone className="size-4" /> {VENUE.phone.display}
                </a>
              </Button>
            </div>
          </div>

          <img
            src={HERO_FLYER.large}
            srcSet={`${HERO_FLYER.small} 560w, ${HERO_FLYER.large} 1122w`}
            sizes="(min-width: 768px) 480px, 92vw"
            width={1122}
            height={HERO_FLYER.height}
            alt={HERO_FLYER.alt}
            fetchPriority="high"
            className="mx-auto h-auto w-full max-w-[480px] rounded-2xl border border-lime/40"
          />
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-16 px-4 py-16 sm:px-6">
        {/* The night */}
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6">
            <UtensilsCrossed className="size-6 text-lime" />
            <h2 className="mt-3 font-display text-xl font-bold">Jamaican Dinners</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Available all night, with food service from {FRIDAY_LIME.foodFrom}.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <Music className="size-6 text-lime" />
            <h2 className="mt-3 font-display text-xl font-bold">Music by DJs</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {FRIDAY_LIME.genres.join(" · ")}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <Ticket className="size-6 text-lime" />
            <h2 className="mt-3 font-display text-xl font-bold">Entry</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              $20 after midnight, as Friday night runs into Saturday morning.
            </p>
          </div>
        </section>

        {/* Flyers */}
        <section>
          <h2 className="text-center font-display text-2xl font-bold sm:text-3xl">The Flyers</h2>
          <div className="mx-auto mt-6 grid max-w-3xl gap-6 sm:grid-cols-2">
            {MORE_FLYERS.map((flyer) => (
              <a key={flyer.large} href={flyer.large} target="_blank" rel="noreferrer">
                <img
                  src={flyer.large}
                  srcSet={`${flyer.small} 560w, ${flyer.large} 1122w`}
                  sizes="(min-width: 640px) 372px, 92vw"
                  width={1122}
                  height={flyer.height}
                  alt={flyer.alt}
                  loading="lazy"
                  className="h-auto w-full rounded-xl border border-border transition-colors hover:border-lime"
                />
              </a>
            ))}
          </div>
        </section>

        {/* Venue */}
        <section>
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Where to Lime</h2>
          <div className="mt-6 grid gap-8 md:grid-cols-2">
            <address className="space-y-4 rounded-xl border border-border bg-card p-6 not-italic">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-lime" />
                <div>
                  <p className="font-semibold">{VENUE.name}</p>
                  <p className="text-sm text-muted-foreground">{ADDRESS}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 size-5 shrink-0 text-lime" />
                <a href={`tel:${VENUE.phone.tel}`} className="text-sm hover:text-lime">
                  {VENUE.phone.display}
                </a>
              </div>
              <div className="flex items-start gap-3">
                <CalendarDays className="mt-0.5 size-5 shrink-0 text-lime" />
                <p className="text-sm">Every Friday</p>
              </div>
            </address>
            <div className="overflow-hidden rounded-xl border border-border">
              <iframe
                className="aspect-square w-full sm:aspect-video"
                src={mapsSrc}
                title={`Map of ${VENUE.name}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
