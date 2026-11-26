// Shared by src/routes/dancehall-fridays.tsx. The "-" prefix excludes this
// file from route generation (TanStack Router convention) — see
// src/routes/README.md.
//
// Archived: the Friday series that opened Sept 25, 2026 has ended. The page
// stays up as a record and is listed on /past-events.
import { ArchivedEventBanner } from "@/components/site/ArchivedEventBanner";
import {
  CalendarDays,
  Clock,
  MapPin,
  Ticket,
  Share2,
  Instagram,
  Facebook,
  Twitter,
  Music,
  Gift,
  Car,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SOCIAL_LINKS } from "@/lib/social";
import flyerImg from "@/assets/dancehall-fridays-flyer.jpg";

const SITE_URL = "https://trcevent.com";
const VENUE_NAME = "Banquet Hall – A Place for You";
const VENUE_ADDRESS = "12746 South Halsted Street, Chicago, IL";
const HOST_DJ = "DJ Bad Chargie";

export function dancehallFridaysHead() {
  const imageUrl = `${SITE_URL}${flyerImg}`;
  return {
    meta: [
      { title: "Dancehall Fridays — Girls Night Out | TRC Events" },
      {
        name: "description",
        content:
          "Dancehall Fridays — Girls Night Out with DJ Bad Chargie, a Friday series that opened September 25, 2026 at Banquet Hall – A Place for You, Chicago.",
      },
      { property: "og:title", content: "Dancehall Fridays — Girls Night Out | TRC Events" },
      {
        property: "og:description",
        content:
          "A past Friday series, opened Sept 25, 2026 in Chicago. Presented by Dougiefresh & One Draw Crew.",
      },
      { property: "og:type", content: "article" },
      { property: "og:image", content: imageUrl },
      { property: "og:url", content: `${SITE_URL}/dancehall-fridays/` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Dancehall Fridays — Girls Night Out | TRC Events" },
      {
        name: "twitter:description",
        content:
          "A past Friday series, opened Sept 25, 2026 in Chicago. Presented by Dougiefresh & One Draw Crew.",
      },
      { name: "twitter:image", content: imageUrl },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/dancehall-fridays/` }],
  };
}

export function DancehallFridaysPage() {
  const mapsSrc = `https://www.google.com/maps?q=${encodeURIComponent(VENUE_ADDRESS)}&output=embed`;

  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: "Dancehall Fridays — Girls Night Out",
    startDate: "2026-09-25T21:00:00-05:00",
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    image: [`${SITE_URL}${flyerImg}`],
    location: {
      "@type": "Place",
      name: VENUE_NAME,
      address: VENUE_ADDRESS,
    },
    performer: {
      "@type": "Person",
      name: HOST_DJ,
    },
    organizer: {
      "@type": "Organization",
      name: "TRC Events",
      url: SITE_URL,
    },
  };

  return (
    <div>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />

      <ArchivedEventBanner date="as a Friday series from September 25, 2026" />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6 sm:py-16">
          <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
            <Badge className="bg-gold text-gold-foreground hover:bg-gold">{HOST_DJ}</Badge>
            <Badge variant="outline" className="border-gold/40 text-gold">
              Every Friday Night
            </Badge>
          </div>
          <p className="eyebrow mb-2">Presented by TRC Events</p>
          <h1 className="font-display text-5xl font-extrabold tracking-tight sm:text-7xl">
            Dancehall Fridays
          </h1>
          <p className="mt-1 font-display text-2xl italic text-gradient-gold sm:text-3xl">
            Girls Night Out
          </p>
          <p className="mt-1 text-sm uppercase tracking-wide text-muted-foreground">
            Presented by Dougiefresh &amp; One Draw Crew — &ldquo;It&rsquo;s About Time&rdquo;
          </p>

          <div className="mx-auto mt-6 flex max-w-xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4 text-gold" /> Every Friday · Starting Sept 25, 2026
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4 text-gold" /> 9 PM – Late
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4 text-gold" /> {VENUE_NAME}
            </span>
          </div>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button asChild variant="goldOutline" size="xl">
              <a href="#venue">Venue Info</a>
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-20 px-4 py-16 sm:px-6">
        {/* About */}
        <section className="grid items-center gap-10 md:grid-cols-[1fr_320px]">
          <div>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">Every Friday Night</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Dancehall Fridays brings Chicago its new Girls Night Out — a weekly series presented
              by Dougiefresh &amp; One Draw Crew, with{" "}
              <strong className="text-foreground">{HOST_DJ}</strong> holding down the mic and
              various selectors keeping the dancehall energy going from doors to last call.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Opening night — Friday, September 25, 2026 — ladies are free all night. Every Friday
              after, ladies get in free until midnight with a valid pass, with general admission at
              $20.
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <Gift className="size-4 text-gold" />
              Special opening night: the first 25 ladies receive a free jerk dinner
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Car className="size-4 text-gold" />
              Free parking on-site
            </div>
          </div>
          <img
            src={flyerImg}
            alt="Dancehall Fridays — Girls Night Out flyer, featuring DJ Bad Chargie"
            className="mx-auto w-full max-w-[320px] rounded-2xl border border-gold/30 object-cover"
          />
        </section>

        {/* Lineup */}
        <section>
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Lineup</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border-2 border-gold bg-gold/10 p-5">
              <h3 className="eyebrow mb-3">Host DJ</h3>
              <p className="font-display text-xl font-semibold">{HOST_DJ}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="eyebrow mb-3 flex items-center gap-1.5">
                <Music className="size-3.5 text-gold" /> Music
              </h3>
              <p className="text-sm text-muted-foreground">
                Music by various selectors, presented by Dougiefresh &amp; One Draw Crew
              </p>
            </div>
          </div>
        </section>

        {/* Venue */}
        <section id="venue" className="scroll-mt-20">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Venue &amp; Details</h2>
          <div className="mt-6 grid gap-8 md:grid-cols-2">
            <div className="space-y-4 rounded-xl border border-border bg-card p-6">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-gold" />
                <div>
                  <p className="font-semibold">{VENUE_NAME}</p>
                  <p className="text-sm text-muted-foreground">{VENUE_ADDRESS}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CalendarDays className="mt-0.5 size-5 shrink-0 text-gold" />
                <p className="text-sm">Every Friday night, starting September 25, 2026</p>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 size-5 shrink-0 text-gold" />
                <p className="text-sm">9:00 PM until late</p>
              </div>
              <div className="flex items-start gap-3">
                <Car className="mt-0.5 size-5 shrink-0 text-gold" />
                <p className="text-sm">Free parking</p>
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-border">
              <iframe
                className="aspect-square w-full sm:aspect-video"
                src={mapsSrc}
                title={`Map of ${VENUE_NAME}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>

        {/* Entry */}
        <section id="tickets" className="scroll-mt-20">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Entry</h2>
          <div className="mt-3 inline-flex flex-wrap items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive">
            <Gift className="size-4" />
            Opening night: first 25 ladies get a free jerk dinner
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="relative rounded-xl border-2 border-gold bg-gold/10 p-5 text-center shadow-lg shadow-gold/20">
              <p className="eyebrow mb-1">Fri, Sept 25, 2026</p>
              <p className="font-display text-2xl font-extrabold text-gold">
                Ladies Free All Night
              </p>
            </div>
            <div className="rounded-xl border border-gold/30 bg-card p-5 text-center">
              <p className="eyebrow mb-1">Every Friday After</p>
              <p className="font-display text-2xl font-extrabold text-gold">
                Ladies Free Until Midnight
              </p>
              <p className="mt-1 text-xs text-muted-foreground">With a valid pass</p>
            </div>
            <div className="rounded-xl border border-gold/30 bg-card p-5 text-center">
              <p className="eyebrow mb-1">General Admission</p>
              <p className="font-display text-3xl font-extrabold text-gold">$20</p>
            </div>
          </div>

        </section>

        {/* Share */}
        <section className="rounded-xl border border-border bg-card p-6 text-center">
          <h3 className="eyebrow mb-4 flex items-center justify-center gap-1.5">
            <Share2 className="size-3.5" /> Share Dancehall Fridays
          </h3>
          <div className="mx-auto flex max-w-xs gap-2">
            {[
              { Icon: Instagram, href: SOCIAL_LINKS.instagram, label: "Instagram" },
              { Icon: Facebook, href: SOCIAL_LINKS.facebook, label: "Facebook" },
              { Icon: Twitter, href: SOCIAL_LINKS.twitter, label: "X (Twitter)" },
            ].map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="flex flex-1 items-center justify-center rounded-lg border border-border py-2.5 text-muted-foreground transition-colors hover:border-gold hover:text-gold"
                aria-label={label}
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
