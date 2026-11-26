// Shows one edition of a Thursday event per page load, advancing in order on
// each visit (A → B → C → A …), tracked per browser in localStorage.
//
// All editions are in the static HTML. A tiny inline script picks one before
// they're parsed (no flash) and preloads that edition's flyer; on client-side
// navigation, where the inline script doesn't run, a layout effect picks before
// paint. Without JS the first edition shows. Hidden editions download nothing:
// their images are lazy and their clip posters are applied only when shown.
import { useLayoutEffect, useRef } from "react";
import { eventJsonLd } from "@/lib/thursday/calendar";
import type { ThursdayEdition, ThursdayEvent } from "@/lib/thursday/types";
import { ThursdayEditionView, ThursdayStyles, useEditionClip } from "./ThursdayEdition";

// Advances the per-browser rotation and returns the edition to show. Must stay
// self-contained: it is also serialized into the inline script below.
function pickNextEdition(keys: readonly string[], storageKey: string): string {
  let next: number;
  try {
    const last = keys.indexOf(window.localStorage.getItem(storageKey) || "");
    next = last < 0 ? 0 : (last + 1) % keys.length;
    window.localStorage.setItem(storageKey, keys[next]);
  } catch {
    // Storage blocked (private mode, etc.): at least vary it between loads.
    next = Math.floor(Math.random() * keys.length);
  }
  return keys[next];
}

type Props = {
  event: ThursdayEvent;
  editions: readonly ThursdayEdition[];
};

export function RotatingEditions({ event, editions }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const keys = editions.map((e) => e.key);
  const storageKey = `thx-edition:${event.slug}`;
  const heroes = Object.fromEntries(
    editions.map((e) => [e.key, { srcSet: e.flyer.srcSet, sizes: e.flyer.sizes }]),
  );

  const inlineScript = `(function(){var el=document.currentScript&&document.currentScript.parentElement;if(!el)return;var k=(${pickNextEdition.toString()})(${JSON.stringify(keys)},${JSON.stringify(storageKey)});el.setAttribute("data-show",k);var h=${JSON.stringify(heroes)}[k];if(h){var l=document.createElement("link");l.rel="preload";l.as="image";l.setAttribute("imagesrcset",h.srcSet);l.setAttribute("imagesizes",h.sizes);l.setAttribute("fetchpriority","high");document.head.appendChild(l);}})();`;

  // Hide every edition except the chosen one; with no choice yet, show the first.
  const rotateCss =
    keys
      .map((k) => `.thx-rotate[data-show="${k}"]>[data-edition]:not([data-edition="${k}"])`)
      .join(",") +
    `,.thx-rotate:not([data-show])>[data-edition]:not([data-edition="${keys[0]}"]){display:none}`;

  useLayoutEffect(() => {
    const el = ref.current;
    if (el && !el.hasAttribute("data-show")) {
      el.setAttribute("data-show", pickNextEdition(keys, storageKey));
    }
    // Runs once on mount; keys/storageKey are fixed for the page.
  }, []);

  useEditionClip(
    ref,
    () => `[data-edition="${ref.current?.getAttribute("data-show") || keys[0]}"]`,
  );

  return (
    <div className="thx-rotate" ref={ref} suppressHydrationWarning>
      <style>{rotateCss}</style>
      {/* Server and client bundles minify pickNextEdition differently; the
          server's copy is the one that ran, so a mismatch here is expected. */}
      <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: inlineScript }} />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          // Escape "<" so no string in the data can close the script tag early.
          __html: JSON.stringify(eventJsonLd(event, editions[0].flyer)).replace(/</g, "\\u003c"),
        }}
      />
      <ThursdayStyles />
      {editions.map((edition) => (
        <div key={edition.key} data-edition={edition.key}>
          <ThursdayEditionView event={event} edition={edition} deferMedia />
        </div>
      ))}
    </div>
  );
}

/** A single edition on its own page (no rotation). */
export function SingleEdition({
  event,
  edition,
}: {
  event: ThursdayEvent;
  edition: ThursdayEdition;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEditionClip(ref, () => "");
  return (
    <div ref={ref}>
      <ThursdayStyles />
      <ThursdayEditionView event={event} edition={edition} deferMedia={false} />
    </div>
  );
}
