// Shared types for the Thursday-night page template.
//
// A Thursday night has ONE ThursdayEvent (the facts: venue, time, takeout offer,
// holiday nights) and one or more ThursdayEditions (a visual design: theme,
// artwork, clip and copy). Every edition renders the same sections in the same
// order — see src/components/thursday/ThursdayEdition.tsx — so a new design is a
// new ThursdayEdition object, not a new page.

/** An image with a responsive srcset. Build it with `responsiveImage()`. */
export type ResponsiveImage = {
  src: string;
  srcSet: string;
  sizes: string;
  width: number;
  height: number;
  alt: string;
};

/** A two-line display heading: [first line, accent line]. */
export type TwoLineHeading = readonly [string, string];

export type ThursdayTheme = {
  /**
   * CSS custom properties for this design. Every key in THEME_VARS
   * (ThursdayEdition.tsx) must be set; the comments there say what each one does.
   */
  vars: Record<`--${string}`, string>;
  /** Which side of the hero the flyer sits on (desktop; phones always stack copy first). */
  heroArt: "left" | "right";
  /** Flyer and clip frame: a thin glowing border, or a solid offset block behind. */
  frame: "glow" | "offset";
  /** Hero facts row: plain text, ruled top and bottom, or a solid accent pill. */
  facts: "plain" | "rule" | "pill";
};

export type ThursdayEdition = {
  /** URL-safe key, also the edition's own page: /<event.slug>/<key>. */
  key: string;
  /** Internal design name, used in comments and the edition page title. */
  label: string;
  theme: ThursdayTheme;
  flyer: ResponsiveImage;
  intro: string;
  /** Photo + story section under the hero. Omit until the design has artwork for it. */
  feature?: {
    image: ResponsiveImage;
    heading: TwoLineHeading;
    hook: string;
    body: string;
  };
  /** Photo for the takeout section in this design's style. Omit for a text-only band. */
  takeoutImage?: ResponsiveImage;
  /** The two "what to expect" columns. */
  story: readonly [{ heading: string; body: string }, { heading: string; body: string }];
  /** The animated flyer clip. `poster` is a still of its first frame. */
  clip?: { src: string; poster: string; label: string };
  /** A picture and caption shown in place of the clip when there isn't one. */
  still?: { image: ResponsiveImage; caption: string };
};

export type HolidayNight = {
  /** ISO date, e.g. "2026-12-24". */
  date: string;
  /** Display date, e.g. "Thursday, December 24, 2026". */
  dateLabel: string;
  /** Price in US dollars. */
  price: number;
  title: string;
  description: string;
  /** True if this night replaces the regular weekly night (skipped in the weekly calendar entry). */
  replacesWeekly: boolean;
  /** The night's own page. */
  href: string;
};

export type ThursdayEvent = {
  /** Page path segment, e.g. "irie-jerk-and-juggling". */
  slug: string;
  name: TwoLineHeading;
  presenter: string;
  description: string;
  venue: {
    name: string;
    /** Short name for headings, e.g. "Irie Jerk". */
    shortName: string;
    street: string;
    city: string;
    region: string;
    postalCode: string;
    mapsUrl: string;
    /** Venue phone: shown as text, dialled via the tel: number (E.164). */
    phone: { display: string; tel: string };
  };
  schedule: {
    /** First night, ISO date. */
    startDate: string;
    /** 24h local times, "HH:MM". */
    startTime: string;
    endTime: string;
    timeZone: string;
    /** UTC offset on the first night, e.g. "-06:00" (used in structured data). */
    utcOffset: string;
    /** e.g. "5–9 PM". */
    timeLabel: string;
  };
  admission: string;
  takeout: {
    heading: TwoLineHeading;
    offer: string;
    items: string;
    pickup: string;
  };
  holidays: readonly HolidayNight[];
  allEventsHref: string;
  /** Static .ics file in public/ (weekly recurring event). */
  icsHref: string;
  /** Absolute share image URL. */
  ogImage: string;
};
