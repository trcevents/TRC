// Shared by src/routes/terms.tsx. The "-" prefix excludes this file from route
// generation (TanStack Router convention) — see src/routes/README.md.
//
// Approved for publishing 2026-11-26. Update EFFECTIVE_DATE when it changes.
import { Link } from "@tanstack/react-router";
import { SOCIAL_LINKS } from "@/lib/social";

const SITE_URL = "https://trcevent.com";
const EFFECTIVE_DATE = "November 26, 2026";
const TITLE = "Terms of Service | TRC Events";
const DESCRIPTION = "The terms that apply when you use trcevent.com, run by Ras Tafari Inc.";

export function termsHead() {
  return {
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: `${SITE_URL}/terms/` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/terms/` }],
  };
}

const TERMS: [string, string][] = [
  [
    "Events",
    "Dates, times, lineups, prices and venues can change or be cancelled. Venues set their own entry rules, including age limits, and may refuse entry. Tickets bought through another company follow that company's terms, including refunds.",
  ],
  [
    "Your submissions",
    "Submit only what you have the right to share. You keep ownership, and you allow us to display and use your song pairings, display name, bio and promo material to run and promote our events. We may approve, decline or remove any submission.",
  ],
  ["Sign-in codes", "Keep your codes private. Do not use another person's email address."],
  [
    "Acceptable use",
    "Do not break the law, harass others, send false submissions, or try to disrupt the site or reach data you are not allowed to see.",
  ],
  [
    "Performer agreements",
    "A signed performance agreement controls over these terms if they conflict.",
  ],
  [
    "Content and links",
    "Our logos, flyers and text belong to us or to their owners. Please ask before reusing them. We are not responsible for other websites we link to.",
  ],
  [
    "No warranty",
    'The site is provided "as is". To the extent the law allows, Ras Tafari Inc is not liable for indirect or consequential losses from using the site.',
  ],
  ["Law", "Illinois law applies."],
];

export function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="eyebrow mb-3">TRC Events</p>
      <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
        Terms of Service
      </h1>
      <p className="mt-4 text-sm text-muted-foreground">Effective {EFFECTIVE_DATE}</p>
      <p className="mt-6 leading-relaxed text-muted-foreground">
        These terms apply to trcevent.com, run by Ras Tafari Inc (TRC Events). By using the site you
        agree to them. See also our{" "}
        <Link to="/privacy" className="text-gold hover:underline">
          Privacy Policy
        </Link>
        .
      </p>

      {TERMS.map(([title, text]) => (
        <section key={title} className="mt-8">
          <h2 className="font-display text-xl font-bold sm:text-2xl">{title}</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">{text}</p>
        </section>
      ))}

      <section className="mt-8">
        <h2 className="font-display text-xl font-bold sm:text-2xl">Contact</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          <a href={`mailto:${SOCIAL_LINKS.email}`} className="text-gold hover:underline">
            {SOCIAL_LINKS.email}
          </a>
        </p>
      </section>
    </div>
  );
}
