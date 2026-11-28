// Irie Jerk & Juggling pages. Shared by:
//   src/routes/index.tsx                              "/" (this week's city)
//   src/routes/irie-jerk-and-juggling.tsx             "/irie-jerk-and-juggling" (this week's city)
//   src/routes/irie-jerk-and-juggling_.$edition.tsx   "/irie-jerk-and-juggling/<city>"
// The "-" prefix excludes this file from route generation (src/routes/README.md).
//
// Content lives in src/lib/thursday/ (facts, editions, weekly schedule); layout
// in src/components/thursday/.
import { EditionPage, WeeklyEdition } from "@/components/thursday/WeeklyEdition";
import { pageUrl } from "@/lib/thursday/calendar";
import {
  IRIE_JERK_JUGGLING as EVENT,
  IRIE_JERK_JUGGLING_EDITIONS as EDITIONS,
} from "@/lib/thursday/irie-jerk-juggling";
import {
  currentThursday,
  editionKeyFor,
  firstDateFor,
  longDate,
} from "@/lib/thursday/schedule";
import type { ThursdayEdition } from "@/lib/thursday/types";

const SITE_URL = "https://trcevent.com";
const PAGE_URL = pageUrl(EVENT);
const TITLE = "Irie Jerk & Juggling | Free Thursdays, 5–9 PM";

function head(opts: { title: string; shareTitle: string; url: string; editionKey: string }) {
  const edition = findIrieJerkJugglingEdition(opts.editionKey);
  const image = `${SITE_URL}/og-thursdays/${opts.editionKey}.jpg`;
  return {
    meta: [
      { title: opts.title },
      { name: "description", content: EVENT.description },
      { property: "og:title", content: opts.shareTitle },
      { property: "og:description", content: EVENT.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: opts.url },
      { property: "og:image", content: image },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: edition?.flyer.alt ?? TITLE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: opts.shareTitle },
      { name: "twitter:description", content: EVENT.description },
      { name: "twitter:image", content: image },
    ],
    links: [{ rel: "canonical", href: opts.url }],
  };
}

export const irieJerkJugglingLoader = () => ({ loadedAt: new Date().toISOString() });

export function irieJerkJugglingHead(loadedAt?: string) {
  const date = currentThursday(loadedAt ? new Date(loadedAt) : new Date());
  return head({
    title: "Irie Jerk & Juggling | Thursdays in Calumet Park | TRC Events",
    shareTitle: TITLE,
    url: PAGE_URL,
    editionKey: editionKeyFor(date),
  });
}

export function IrieJerkJugglingPage({ loadedAt }: { loadedAt: string }) {
  return <WeeklyEdition event={EVENT} editions={EDITIONS} loadedAt={loadedAt} />;
}

export function findIrieJerkJugglingEdition(key: string): ThursdayEdition | undefined {
  return EDITIONS.find((e) => e.key === key);
}

/** Each city page has its own address and share image, so posts show that flyer. */
export function irieJerkJugglingEditionHead(key: string) {
  const label = findIrieJerkJugglingEdition(key)?.label ?? "";
  const date = firstDateFor(key);
  const when = date ? longDate(date) : "Thursdays";
  return head({
    title: `Irie Jerk & Juggling: ${label} Edition | TRC Events`,
    shareTitle: `Irie Jerk & Juggling: ${label} · ${when}`,
    url: `${PAGE_URL}${key}/`,
    editionKey: key,
  });
}

export function IrieJerkJugglingEditionPage({ edition }: { edition: ThursdayEdition }) {
  const date = firstDateFor(edition.key) ?? currentThursday();
  return <EditionPage key={edition.key} event={EVENT} edition={edition} date={date} />;
}
