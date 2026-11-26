# Thursday-night page template

One layout for every Thursday-night page. A night has **one event** (the facts)
and **one or more editions** (visual designs). Every edition renders the same
sections in the same order, so designs differ only in look, never in structure.

| File | What it holds |
|---|---|
| `src/lib/thursday/types.ts` | `ThursdayEvent`, `ThursdayEdition`, `ThursdayTheme` |
| `src/lib/thursday/<night>-event.ts` | The event facts: venue, schedule, takeout, holiday nights. No asset imports. |
| `src/lib/thursday/<night>.ts` | The editions: theme, flyer, photos, clip, copy. |
| `src/lib/thursday/calendar.ts` | Google Calendar link, `.ics` body, schema.org Event data, labels |
| `ThursdayEdition.tsx` | The layout and its CSS. Theme variables are documented at the top. |
| `RotatingEditions.tsx` | Rotation (one edition per visit, in order) and the single-edition page |

Live example: Irie Jerk & Juggling (`irie-jerk-juggling-event.ts`,
`irie-jerk-juggling.ts`, routes in `src/routes/-irie-jerk-juggling-page.tsx`).

## Sections (in order)

1. **Hero**: presenter, name, intro, facts (Thursdays · time · admission · "Every Thursday from …"), address, Get directions / Add to calendar / Google Calendar, flyer
2. **Feature**: photo, two-line heading, story (only if the edition has `feature`)
3. **Takeout**: the event's takeout offer, with the edition's photo if it has `takeoutImage`
4. **Story**: two "what to expect" columns
5. **Clip**: the edition's animated flyer, with a still of its first frame as the cover
6. **Holidays**: holiday-night cards and a link to all events

## Add a design to an existing night

1. Put the original artwork in `src/assets/originals/`. Make the WebP web copies
   and the clip cover image (commands in `src/assets/originals/README.md`).
2. Add a `ThursdayEdition` to the night's editions file and append it to the
   editions array. The array order is the rotation order.
3. Add `/<night>/<key>` to `prerender.pages` in `vite.config.ts`.

## Add a new Thursday night

1. Create `<night>-event.ts` (copy the Irie Jerk one) and `<night>.ts` with at
   least one edition.
2. Add the event to the loop in `scripts/thursday-ics.ts` and run
   `node scripts/thursday-ics.ts` to write its `.ics` into `public/`.
3. Add routes like the Irie Jerk ones: a page file using `RotatingEditions`
   (or `SingleEdition`) and a `<night>_.$edition.tsx` route.

After changing an event's schedule, venue or description, re-run
`node scripts/thursday-ics.ts` so the calendar file matches.
