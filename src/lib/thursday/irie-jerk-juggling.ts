// Irie Jerk & Juggling: the event facts and its three design editions.
//
// The page rotates through EDITIONS in order on each visit (see
// src/components/thursday/RotatingEditions.tsx), and each edition also has its
// own page at /irie-jerk-and-juggling/<key>.
//
// Images are WebP web copies of the originals in src/assets/originals/ (see the
// README there). Clips are the supplied files, untouched; each poster is a still
// of its clip's first frame.
//
// To add a design: add web copies + a poster, then append a ThursdayEdition here
// (and its path to `prerender.pages` in vite.config.ts).
import { responsiveImage } from "./calendar";
import type { ThursdayEdition } from "./types";
export { IRIE_JERK_JUGGLING } from "./irie-jerk-juggling-event";

import tokyoFlyer560 from "@/assets/irie-jerk-juggling-tokyo-flyer-560.webp";
import tokyoFlyer1122 from "@/assets/irie-jerk-juggling-tokyo-flyer-1122.webp";
import chorus724 from "@/assets/irie-jerk-juggling-chorus-724.webp";
import chorus1448 from "@/assets/irie-jerk-juggling-chorus-1448.webp";
import tokyoClip from "@/assets/irie-jerk-juggling-tokyo-clip.mp4";
import tokyoPoster from "@/assets/irie-jerk-juggling-tokyo-clip-poster.webp";

import cphFlyer560 from "@/assets/irie-jerk-juggling-copenhagen-flyer-560.webp";
import cphFlyer1122 from "@/assets/irie-jerk-juggling-copenhagen-flyer-1122.webp";
import table724 from "@/assets/irie-jerk-juggling-table-724.webp";
import table1448 from "@/assets/irie-jerk-juggling-table-1448.webp";
import cphClip from "@/assets/irie-jerk-juggling-copenhagen-clip.mp4";
import cphPoster from "@/assets/irie-jerk-juggling-copenhagen-clip-poster.webp";

import seoulFlyer560 from "@/assets/irie-jerk-juggling-flyer-560.webp";
import seoulFlyer1122 from "@/assets/irie-jerk-juggling-flyer-1122.webp";
import takeout724 from "@/assets/irie-jerk-juggling-takeout-724.webp";
import takeout1448 from "@/assets/irie-jerk-juggling-takeout-1448.webp";
import seoulClip from "@/assets/irie-jerk-juggling-clip.mp4";
import seoulPoster from "@/assets/irie-jerk-juggling-seoul-clip-poster.webp";

// Rendered widths (see the layout in ThursdayEdition.tsx): the hero flyer is at most
// 576px wide (480px on phones); feature/takeout photos are at most 724px.
const FLYER_SIZES = "(max-width: 760px) min(92vw, 480px), 576px";
const PHOTO_SIZES = "(max-width: 760px) 92vw, 724px";
const flyer = (small: string, large: string, alt: string) =>
  responsiveImage({
    small,
    smallWidth: 560,
    large,
    largeWidth: 1122,
    height: 1402,
    sizes: FLYER_SIZES,
    alt,
  });
const photo = (small: string, large: string, alt: string) =>
  responsiveImage({
    small,
    smallWidth: 724,
    large,
    largeWidth: 1448,
    height: 1086,
    sizes: PHOTO_SIZES,
    alt,
  });

const SYSTEM = "system-ui, sans-serif";

export const TOKYO: ThursdayEdition = {
  key: "tokyo",
  label: "Tokyo",
  theme: {
    heroArt: "right",
    frame: "glow",
    facts: "plain",
    vars: {
      "--bg": "#05090d",
      "--fg": "#f0f7fc",
      "--muted": "#b8ccd8",
      "--line": "#315162",
      "--line-strong": "#638499",
      "--accent": "#8ce3ff",
      "--on-accent": "#03141c",
      "--glow": "#45c5ff44",
      "--offset": "transparent",
      "--surface": "#0b151d",
      "--label": "#8ce3ff",
      "--label-font": "ui-monospace, monospace",
      "--body-font": SYSTEM,
      "--lede-font": SYSTEM,
      "--display-font": SYSTEM,
      "--display-style": "normal",
      "--display-track": "-0.07em",
      "--display-accent": "#8ce3ff",
      "--h2-font": SYSTEM,
      "--h2-style": "normal",
      "--h2-weight": "700",
      "--h2-track": "-0.045em",
      "--btn-bg": "#8ce3ff",
      "--btn-fg": "#03141c",
      "--ghost": "#8ce3ff",
      "--hero-bg": "radial-gradient(ellipse at 70% 50%, #14374b 0%, #070e15 54%, #05090d 78%)",
      "--feature-bg": "linear-gradient(120deg, #08131c, #102c3c)",
      "--takeout-bg": "linear-gradient(240deg, #08131c, #0d2533)",
      "--story-bg": "repeating-linear-gradient(0deg, #091118 0 5px, #0b141b 6px 7px)",
      "--story-fg": "#f0f7fc",
      "--story-muted": "#b8ccd8",
    },
  },
  flyer: flyer(
    tokyoFlyer560,
    tokyoFlyer1122,
    "Irie Jerk & Juggling flyer with a chrome tonearm and translucent record under ice-blue light.",
  ),
  intro:
    "A Thursday evening dance party built around Jamaican food and the dancehall tunes you already know by heart.",
  feature: {
    image: photo(
      chorus724,
      chorus1448,
      "At a chrome DJ booth, a hand pulls down the fader while two friends and the crowd sing along beyond the turntable.",
    ),
    heading: ["The DJ cuts it.", "You finish it."],
    hook: "Dancehall you know by heart.",
    body: "You hear the first bars and turn to your friends. The DJ drops the volume right on the hook. For a few bars, the whole room is louder than the speakers.",
  },
  story: [
    {
      heading: "Catch a dance after work.",
      body: "Meet your people on 127th Street and get on the floor when your tune comes on. The set is heavy on dancehall, with familiar hooks you can jump into even if you only know the chorus.",
    },
    {
      heading: "Jamaica from the kitchen to the dance floor.",
      body: "Start with a plate from Irie Jerk’s state-of-the-art Jamaican kitchen. Then get up when your tune comes on. The cooking, the DJ’s juggling, and the crowd singing back bring Jamaican culture to life right here on 127th Street.",
    },
  ],
  clip: {
    src: tokyoClip,
    poster: tokyoPoster,
    label: "Animated Irie Jerk and Juggling flyer, Tokyo edition",
  },
};

export const COPENHAGEN: ThursdayEdition = {
  key: "copenhagen",
  label: "Copenhagen",
  theme: {
    heroArt: "right",
    frame: "offset",
    facts: "rule",
    vars: {
      "--bg": "#f7e8d4",
      "--fg": "#350741",
      "--muted": "#5a3766",
      "--line": "#a173ab",
      "--line-strong": "#a173ab",
      "--accent": "#693282",
      "--on-accent": "#fff6ea",
      "--glow": "transparent",
      "--offset": "#c5a0d5",
      "--surface": "#efdcc6",
      "--label": "#693282",
      "--label-font": SYSTEM,
      "--body-font": SYSTEM,
      "--lede-font": "Georgia, serif",
      "--display-font": SYSTEM,
      "--display-style": "normal",
      "--display-track": "-0.08em",
      "--display-accent": "#693282",
      "--h2-font": "Georgia, serif",
      "--h2-style": "italic",
      "--h2-weight": "500",
      "--h2-track": "-0.05em",
      "--btn-bg": "#350741",
      "--btn-fg": "#fff6ea",
      "--ghost": "#350741",
      "--hero-bg": "#f7e8d4",
      "--feature-bg": "#edd6be",
      "--takeout-bg": "#f7e8d4",
      "--story-bg": "#ebd3f0",
      "--story-fg": "#350741",
      "--story-muted": "#4a2552",
    },
  },
  flyer: flyer(
    cphFlyer560,
    cphFlyer1122,
    "Irie Jerk and Juggling flyer with charred scallion, lime and thyme suspended above a ceramic plate, in lavender and warm clay.",
  ),
  intro:
    "Start with something hot from the Jamaican kitchen. Stay for the tunes you know by heart.",
  feature: {
    image: photo(
      table724,
      table1448,
      "Friends pass a ceramic plate of jerk chicken while a guest dances beside her chair in a warmly lit restaurant.",
    ),
    heading: ["Pass the jerk.", "Catch the riddim."],
    hook: "Grab a plate. Pull up a chair. Get up when your tune comes on.",
    body: "Meet your people over a charred jerk chicken leg quarter from Irie Jerk’s Jamaican kitchen. One minute you’re passing the plate across the table. The next, somebody’s pushed back their chair because the DJ just played their tune.",
  },
  story: [
    {
      heading: "The kitchen gets first word.",
      body: "Come hungry. Irie Jerk’s state-of-the-art Jamaican kitchen is part of the Thursday night out on 127th Street. Pull up a chair, bring a friend, and order something you’ll still be talking about when you get home.",
    },
    {
      heading: "The chorus belongs to the room.",
      body: "This is an evening dance party with a heavy dose of dancehall. Catch a riddim you know, get up for the next tune, and when the DJ turns it down and calls for voices, sing the hook right back. Jamaican cooking and sound-system culture share the room.",
    },
  ],
  clip: {
    src: cphClip,
    poster: cphPoster,
    label: "Animated Irie Jerk and Juggling flyer, Copenhagen edition",
  },
};

export const SEOUL: ThursdayEdition = {
  key: "seoul",
  label: "Seoul",
  theme: {
    heroArt: "left",
    frame: "offset",
    facts: "pill",
    vars: {
      "--bg": "#071233",
      "--fg": "#f9faff",
      "--muted": "#cad5fb",
      "--line": "#6579c4",
      "--line-strong": "#8a9dfc",
      "--accent": "#ff665b",
      "--on-accent": "#1b1032",
      "--glow": "transparent",
      "--offset": "#ff665b",
      "--surface": "#111f4b",
      "--label": "#cad5fb",
      "--label-font": SYSTEM,
      "--body-font": SYSTEM,
      "--lede-font": SYSTEM,
      "--display-font": SYSTEM,
      "--display-style": "italic",
      "--display-track": "-0.085em",
      "--display-accent": "#ff665b",
      "--h2-font": SYSTEM,
      "--h2-style": "italic",
      "--h2-weight": "900",
      "--h2-track": "-0.065em",
      "--btn-bg": "#ff665b",
      "--btn-fg": "#1b1032",
      "--ghost": "#f9faff",
      "--hero-bg":
        "radial-gradient(ellipse at 24% 56%, #193ab2, transparent 65%), linear-gradient(122deg, #071233 56%, #112676 56% 72%, #0d1b4e 72%)",
      "--feature-bg": "linear-gradient(115deg, #142aa0, #071233 70%)",
      "--takeout-bg": "linear-gradient(115deg, #142aa0, #071233 70%)",
      "--story-bg": "#163ae4",
      "--story-fg": "#f9faff",
      "--story-muted": "#e6ebff",
    },
  },
  flyer: flyer(
    seoulFlyer560,
    seoulFlyer1122,
    "Irie Jerk and Juggling flyer with two people in sculptural streetwear moving through a cobalt and coral light tunnel.",
  ),
  intro:
    "Clock out and meet us on 127th. It’s a Thursday evening dance party with a heavy dose of dancehall and hooks the whole room can sing.",
  // No feature photo for Seoul yet; its takeout photo carries the section instead.
  takeoutImage: photo(
    takeout724,
    takeout1448,
    "Two guests leave a cobalt-and-coral dance party with clear-lidded takeout boxes. Jerk chicken and sides are visible in the foreground.",
  ),
  story: [
    {
      heading: "Know the hook? Take it from here.",
      body: "The DJ juggles familiar dancehall tunes and riddims until something pulls you onto the floor. Then the volume drops and the DJ calls for voices. That’s your cue to sing it loud, even if you only know the chorus.",
    },
    {
      heading: "Come hungry.",
      body: "Order from Irie Jerk’s state-of-the-art Jamaican kitchen and catch up with your people over a plate. When your tune comes on, the dance floor is right there. This is Jamaican culture on a Thursday in Calumet Park, from the cooking to the way the crowd answers the DJ.",
    },
  ],
  clip: {
    src: seoulClip,
    poster: seoulPoster,
    label: "Animated Irie Jerk and Juggling flyer, Seoul edition",
  },
};

/** Rotation order. */
export const IRIE_JERK_JUGGLING_EDITIONS: readonly ThursdayEdition[] = [TOKYO, COPENHAGEN, SEOUL];
