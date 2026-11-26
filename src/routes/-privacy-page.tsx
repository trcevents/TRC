// Shared by src/routes/privacy.tsx. The "-" prefix excludes this file from
// route generation (TanStack Router convention) — see src/routes/README.md.
//
// Approved for publishing 2026-11-26. It describes what the forms really
// collect, so update it (and EFFECTIVE_DATE) when a form or outside service
// changes.
import type { ReactNode } from "react";
import { SOCIAL_LINKS } from "@/lib/social";

const SITE_URL = "https://trcevent.com";
const EFFECTIVE_DATE = "November 26, 2026";
const TITLE = "Privacy Policy | TRC Events";
const DESCRIPTION =
  "What trcevent.com collects, how TRC Events uses it, and how to ask to see, correct or delete it.";

export function privacyHead() {
  return {
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: `${SITE_URL}/privacy/` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/privacy/` }],
  };
}

const COLLECTED: [string, string][] = [
  ["Event updates", "your email address."],
  [
    "Sing Ova",
    "your email, display name, song pairings, notes and the pairings you heart. Approved pairings show your display name and note publicly. Your email is not shown publicly.",
  ],
  [
    "Ticket and comp requests",
    "name, email, phone, crew or organization, social media handles, ticket numbers, who referred you and any notes.",
  ],
  [
    "Performer contracts",
    "legal and business name, address, email, phone, emergency contact, name on your government ID, payment method and payee details, additional people and guests, and your typed signature.",
  ],
  [
    "Performer technical and promo forms",
    "social handles, short bio, press photo link and equipment needs.",
  ],
  ["Staff sign-in", "staff email addresses, used to send one-time codes."],
];

const SERVICES = [
  "Supabase (database, files and server functions)",
  "Resend (email delivery)",
  "GitHub Pages (website hosting)",
  "Google Fonts and Google Maps (fonts and embedded maps, which connect your browser to Google)",
  "Anthropic (a staff-only planning tool that turns typed or dictated notes into event ideas)",
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-bold sm:text-2xl">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

function ContactLink() {
  return (
    <a href={`mailto:${SOCIAL_LINKS.email}`} className="text-gold hover:underline">
      {SOCIAL_LINKS.email}
    </a>
  );
}

export function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="eyebrow mb-3">TRC Events</p>
      <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
        Privacy Policy
      </h1>
      <p className="mt-4 text-sm text-muted-foreground">Effective {EFFECTIVE_DATE}</p>
      <p className="mt-6 leading-relaxed text-muted-foreground">
        This policy covers trcevent.com, run by Ras Tafari Inc (TRC Events), an Illinois nonprofit
        corporation and 501(c)(3) organization. Contact us at <ContactLink />.
      </p>

      <Section title="What we collect">
        <p>We collect what you type into our forms:</p>
        <ul className="list-disc space-y-2 pl-5">
          {COLLECTED.map(([label, text]) => (
            <li key={label}>
              <strong className="text-foreground">{label}:</strong> {text}
            </li>
          ))}
        </ul>
        <p>
          Our hosting providers also receive standard technical information, such as your IP address
          and browser type, when you visit.
        </p>
      </Section>

      <Section title="How we use it">
        <p>
          To run our events, send the messages you ask for (sign-in codes, confirmations and event
          updates), review requests and submissions, prepare and keep performer agreements, pay
          performers, and meet legal and tax duties. We do not sell your information.
        </p>
      </Section>

      <Section title="Who can see it">
        <p>
          Our authorized team members. When you name someone who referred you for tickets, that
          person may receive a copy of your request. We use these services to run the site:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          {SERVICES.map((service) => (
            <li key={service}>{service}</li>
          ))}
        </ul>
        <p>We may also share information when the law requires it.</p>
      </Section>

      <Section title="Cookies and browser storage">
        <p>
          We do not use advertising or analytics trackers. Your browser stores a few items so the
          site works, such as keeping you signed in and remembering which page design you last saw.
          Clearing your browser data removes them. Embedded maps and other third-party services may
          set their own cookies.
        </p>
      </Section>

      <Section title="Keeping and deleting information">
        <p>
          We keep information as long as we need it for the purposes above. To see, correct or delete
          your information, email <ContactLink />. We may need to keep some records, such as signed
          agreements and payment records.
        </p>
      </Section>

      <Section title="Children">
        <p>
          The site is not directed to children under 13, and we do not knowingly collect their
          information.
        </p>
      </Section>

      <Section title="Changes">
        <p>We will post any update on this page with a new effective date.</p>
      </Section>
    </div>
  );
}
