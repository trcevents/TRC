// Writes the weekly-series calendar file for each Thursday event into public/.
// Run after changing an event's schedule, venue or description:
//   node scripts/thursday-ics.ts
// (Node 22.6+ runs TypeScript directly by stripping types.)
import { writeFileSync } from "node:fs";
import { icsFile } from "../src/lib/thursday/calendar.ts";
import { IRIE_JERK_JUGGLING } from "../src/lib/thursday/irie-jerk-juggling-event.ts";

for (const event of [IRIE_JERK_JUGGLING]) {
  const out = new URL(`../public${event.icsHref}`, import.meta.url);
  writeFileSync(out, icsFile(event));
  console.log("wrote", out.pathname);
}
