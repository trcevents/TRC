// Shared by src/routes/about.tsx. The "-" prefix excludes this file from route
// generation (TanStack Router convention) — see src/routes/README.md.
//
// Approved for publishing 2026-11-26.
import { Link } from "@tanstack/react-router";
import { SOCIAL_LINKS } from "@/lib/social";

const SITE_URL = "https://trcevent.com";
const TITLE = "About TRC Events | The Right Connection";
const DESCRIPTION =
  "TRC Events is the events and marketing arm of Ras Tafari Inc, connecting Chicagoland's reggae community.";

export function aboutHead() {
  return {
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: `${SITE_URL}/about/` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/about/` }],
  };
}

export function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="eyebrow mb-3">The Right Connection. The Reggae Connection.</p>
      <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
        About <span className="text-gradient-gold">TRC Events</span>
      </h1>
      <div className="mt-6 space-y-4 leading-relaxed text-muted-foreground">
        <p>
          TRC Events is the events and marketing arm of Ras Tafari Inc, an Illinois nonprofit
          corporation and 501(c)(3) organization. Ras Tafari Inc also runs{" "}
          <a
            href="https://selassiefest.com"
            target="_blank"
            rel="noreferrer"
            className="text-gold hover:underline"
          >
            SelassieFest
          </a>
          .
        </p>
        <p>
          We connect Chicagoland's reggae community: DJs, performers, promoters, venues and the
          people who keep the music alive. Our current series are at Irie Jerk Bar and Grill in
          Calumet Park, including{" "}
          <Link to="/irie-jerk-and-juggling" className="text-gold hover:underline">
            Irie Jerk &amp; Juggling
          </Link>{" "}
          on Thursdays and{" "}
          <a href="/sing-ova-sundays/chicago" className="text-gold hover:underline">
            Sing Ova Sundays
          </a>
          .
        </p>
        <p>
          Questions, bookings and partnerships:{" "}
          <a href={`mailto:${SOCIAL_LINKS.email}`} className="text-gold hover:underline">
            {SOCIAL_LINKS.email}
          </a>
        </p>
      </div>
    </div>
  );
}
