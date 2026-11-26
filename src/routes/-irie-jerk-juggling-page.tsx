// Irie Jerk & Juggling pages. Shared by:
//   src/routes/index.tsx                              "/" (rotating)
//   src/routes/irie-jerk-and-juggling.tsx             "/irie-jerk-and-juggling" (rotating)
//   src/routes/irie-jerk-and-juggling_.$edition.tsx   "/irie-jerk-and-juggling/<edition>"
// The "-" prefix excludes this file from route generation (src/routes/README.md).
//
// Content (event facts + the Tokyo/Copenhagen/Seoul editions) lives in
// src/lib/thursday/irie-jerk-juggling.ts; layout in src/components/thursday/.
import { RotatingEditions, SingleEdition } from "@/components/thursday/RotatingEditions";
import { pageUrl } from "@/lib/thursday/calendar";
import {
  IRIE_JERK_JUGGLING as EVENT,
  IRIE_JERK_JUGGLING_EDITIONS as EDITIONS,
} from "@/lib/thursday/irie-jerk-juggling";
import type { ThursdayEdition } from "@/lib/thursday/types";

const PAGE_URL = pageUrl(EVENT);
const TITLE = "Irie Jerk & Juggling | Free Thursdays, 5–9 PM";

export function irieJerkJugglingHead() {
  return {
    meta: [
      { title: "Irie Jerk & Juggling | Thursdays in Calumet Park | TRC Events" },
      { name: "description", content: EVENT.description },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: EVENT.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: PAGE_URL },
      { property: "og:image", content: EVENT.ogImage },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      {
        property: "og:image:alt",
        content:
          "Irie Jerk & Juggling flyer: free Thursdays, 5–9 PM at Irie Jerk Bar and Grill, Calumet Park.",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: EVENT.description },
      { name: "twitter:image", content: EVENT.ogImage },
    ],
    // Edition pages point here too, so search engines treat them as one page.
    links: [{ rel: "canonical", href: PAGE_URL }],
  };
}

export function IrieJerkJugglingPage() {
  return <RotatingEditions event={EVENT} editions={EDITIONS} />;
}

export function findIrieJerkJugglingEdition(key: string): ThursdayEdition | undefined {
  return EDITIONS.find((e) => e.key === key);
}

export function irieJerkJugglingEditionHead(key: string) {
  const base = irieJerkJugglingHead();
  const edition = findIrieJerkJugglingEdition(key);
  if (!edition) return base;
  return {
    ...base,
    meta: base.meta.map((m) =>
      "title" in m ? { title: `Irie Jerk & Juggling (${edition.label} edition) | TRC Events` } : m,
    ),
  };
}

export function IrieJerkJugglingEditionPage({ edition }: { edition: ThursdayEdition }) {
  return <SingleEdition event={EVENT} edition={edition} />;
}
