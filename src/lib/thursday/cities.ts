// The city editions that share one look: colors and copy come from cities.json,
// pictures from src/assets/cities/<key>-{flyer,photo,still}-{s,l}.webp.
import cities from "./cities.json";
import { responsiveImage } from "./calendar";
import type { ResponsiveImage, ThursdayEdition } from "./types";

const files = import.meta.glob<string>("@/assets/cities/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
});
const byName = new Map(Object.entries(files).map(([path, url]) => [path.split("/").pop()!, url]));

type City = (typeof cities)[number];

function picture(city: City, label: "flyer" | "photo" | "still", sizes: string): ResponsiveImage {
  const info = city.images[label];
  const url = (size: "s" | "l") => {
    const found = byName.get(`${city.key}-${label}-${size}.webp`);
    if (!found) throw new Error(`Missing picture for ${city.key}: ${label}-${size}`);
    return found;
  };
  return responsiveImage({
    small: url("s"),
    smallWidth: info.smallWidth,
    large: url("l"),
    largeWidth: info.width,
    height: info.height,
    sizes,
    alt: info.alt,
  });
}

const SYSTEM = "system-ui, sans-serif";
const SERIF = "Georgia, serif";

function edition(city: City, flyerSizes: string, photoSizes: string): ThursdayEdition {
  const t = city.theme;
  return {
    key: city.key,
    label: city.city,
    theme: {
      heroArt: "right",
      frame: "offset",
      facts: "rule",
      vars: {
        "--bg": t.bg,
        "--fg": t.fg,
        "--muted": t.muted,
        "--line": t.line,
        "--line-strong": t.line,
        "--accent": t.accent,
        "--on-accent": t.buttonText,
        "--glow": "transparent",
        "--offset": t.accent2,
        "--surface": t.surface,
        "--label": t.accent,
        "--label-font": SYSTEM,
        "--body-font": SYSTEM,
        "--lede-font": SERIF,
        "--display-font": t.serif ? SERIF : SYSTEM,
        "--display-style": "normal",
        "--display-track": "-0.06em",
        "--display-accent": t.accent,
        "--h2-font": SERIF,
        "--h2-style": "italic",
        "--h2-weight": "600",
        "--h2-track": "-0.045em",
        "--btn-bg": t.accent,
        "--btn-fg": t.buttonText,
        "--ghost": t.accent,
        "--hero-bg": t.hero,
        "--feature-bg": t.feature,
        "--takeout-bg": t.takeout,
        "--story-bg": t.story,
        "--story-fg": t.fg,
        "--story-muted": t.muted,
      },
    },
    flyer: picture(city, "flyer", flyerSizes),
    intro: city.intro,
    feature: {
      image: picture(city, "photo", photoSizes),
      heading: [city.heading[0], city.heading[1]],
      hook: city.hook,
      body: city.body,
    },
    story: [
      { heading: city.story[0][0], body: city.story[0][1] },
      { heading: city.story[1][0], body: city.story[1][1] },
    ],
    still: { image: picture(city, "still", photoSizes), caption: city.caption },
  };
}

export function cityEditions(flyerSizes: string, photoSizes: string): ThursdayEdition[] {
  return cities.map((city) => edition(city, flyerSizes, photoSizes));
}
