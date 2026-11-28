# Thursday-night page template

One layout for every Thursday-night page. A night has **one event** (the facts)
and **one or more editions** (visual designs), one per week. Every edition renders
the same sections in the same order, so designs differ only in look, never in
structure.

| File | What it holds |
|---|---|
| `src/lib/thursday/types.ts` | `ThursdayEvent`, `ThursdayEdition`, `ThursdayTheme` |
| `src/lib/thursday/<night>-event.ts` | The event facts: venue, schedule, takeout, holiday nights. No asset imports. |
| `src/lib/thursday/<night>.ts` | The editions: theme, flyer, photos, clip, copy. |
| `src/lib/thursday/cities.json`, `cities.ts` | The city editions that share one look |
| `src/lib/thursday/schedule.ts` | Which edition shows each Thursday, and the special nights |
| `src/lib/thursday/calendar.ts` | Google Calendar link, `.ics` body, schema.org Event data, labels |
| `ThursdayEdition.tsx` | The layout and its CSS. Theme variables are documented at the top. |
| `WeeklyEdition.tsx` | This week's page and each edition's own page |

Live example: Irie Jerk & Juggling (`irie-jerk-juggling-event.ts`,
`irie-jerk-juggling.ts`, routes in `src/routes/-irie-jerk-juggling-page.tsx`).
The main page shows the city scheduled for the current Thursday. The deploy
workflow rebuilds each Thursday night so the share image moves on too. GitHub
pauses scheduled runs after 60 days without repository activity.

## Sections (in order)

A banner names the edition's Thursday and any special or holiday night.

1. **Hero**: presenter, name, intro, facts (Thursdays · time · admission · "Every Thursday from …"), address, Get directions / Add to calendar / Google Calendar, flyer
2. **Feature**: photo, two-line heading, story (only if the edition has `feature`)
3. **Takeout**: the event's takeout offer, with the edition's photo if it has `takeoutImage`
4. **Story**: two "what to expect" columns
5. **Clip**: the edition's animated flyer, or a picture and caption if it has none
6. **Holidays**: upcoming holiday-night cards and a link to all events

## Change which city shows on a date

Edit the key beside the date in `schedule.ts`.

## Add a design to an existing night

1. Make WebP web copies of the artwork (see `src/assets/originals/README.md`).
2. Add an entry to `cities.json` with pictures in `src/assets/cities/`, or write a
   `ThursdayEdition` in the editions file for a custom look.
3. Put its key beside a date in `schedule.ts`.
4. Add a 1200×630 share image at `public/og-thursdays/<key>.jpg`.

## Add a new Thursday night

1. Create `<night>-event.ts` (copy the Irie Jerk one) and `<night>.ts` with at
   least one edition.
2. Add the event to the loop in `scripts/thursday-ics.ts` and run
   `node scripts/thursday-ics.ts` to write its `.ics` into `public/`.
3. Add routes like the Irie Jerk ones. `WeeklyEdition` currently reads the Irie
   Jerk `schedule.ts`, so a second night needs its own schedule passed in.

After changing an event's schedule, venue or description, re-run
`node scripts/thursday-ics.ts` so the calendar file matches.
