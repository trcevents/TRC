// This week's page: the city scheduled for the current Thursday (schedule.ts),
// with a banner naming the date and any special or holiday night.
//
// The site is static, so the HTML shows the week it was built in. The deploy
// workflow rebuilds every Thursday night, and the browser also works out the
// week itself after loading, so a late rebuild still shows the right city.
import { useEffect, useRef, useState } from "react";
import { eventJsonLd } from "@/lib/thursday/calendar";
import { currentThursday, editionKeyFor } from "@/lib/thursday/schedule";
import type { ThursdayEdition, ThursdayEvent } from "@/lib/thursday/types";
import { ThursdayEditionView, ThursdayStyles, useEditionClip } from "./ThursdayEdition";

type Props = {
  event: ThursdayEvent;
  editions: readonly ThursdayEdition[];
  /** When the route loaded (build time for the prerendered HTML). */
  loadedAt: string;
};

export function WeeklyEdition({ event, editions, loadedAt }: Props) {
  const [date, setDate] = useState(() => currentThursday(new Date(loadedAt)));
  useEffect(() => setDate(currentThursday()), []);
  const key = editionKeyFor(date);
  const edition = editions.find((e) => e.key === key) ?? editions[0];

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          // Escape "<" so no string in the data can close the script tag early.
          __html: JSON.stringify(eventJsonLd(event, edition.flyer)).replace(/</g, "\\u003c"),
        }}
      />
      <EditionPage key={edition.key} event={event} edition={edition} date={date} />
    </>
  );
}

/** One edition for one date. Also used for each city's own page. */
export function EditionPage({
  event,
  edition,
  date,
}: {
  event: ThursdayEvent;
  edition: ThursdayEdition;
  date: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEditionClip(ref, () => "");
  return (
    <div ref={ref}>
      <ThursdayStyles />
      <ThursdayEditionView event={event} edition={edition} date={date} />
    </div>
  );
}
