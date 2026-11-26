// Irie Jerk & Juggling: the event facts, shared by every design edition.
// Kept free of asset imports so scripts/thursday-ics.ts can import it in Node
// to (re)generate public/irie-jerk-and-juggling.ics. After changing the
// schedule, venue or description here, run: node scripts/thursday-ics.ts
//
// Confirmed by the owner (2026-11-25): first night Thursday Dec 3, 2026; the
// Christmas Eve and New Year's Eve parties replace the regular free night on
// those Thursdays; the $15 takeout plate is the whole menu.
import type { ThursdayEvent } from "./types";

export const IRIE_JERK_JUGGLING: ThursdayEvent = {
  slug: "irie-jerk-and-juggling",
  name: ["Irie Jerk", "& Juggling"],
  presenter: "Prestige Promotion",
  description:
    "Irie Jerk & Juggling is a Thursday evening dancehall party in Calumet Park. Jamaican cooking, familiar hooks, and free admission from 5 to 9 PM.",
  venue: {
    name: "Irie Jerk Bar and Grill",
    shortName: "Irie Jerk",
    street: "1413 W 127th St",
    city: "Calumet Park",
    region: "IL",
    postalCode: "60827",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Irie+Jerk+Bar+and+Grill+1413+W+127th+St+Calumet+Park+IL+60827",
    phone: { display: "(872) 255-9333", tel: "+18722559333" },
  },
  schedule: {
    startDate: "2026-12-03",
    startTime: "17:00",
    endTime: "21:00",
    timeZone: "America/Chicago",
    utcOffset: "-06:00",
    timeLabel: "5–9 PM",
  },
  admission: "Free admission",
  takeout: {
    heading: ["Dance now.", "Take the jerk home."],
    offer: "$15 jerk chicken takeout plate",
    items: "Jerk leg quarter · Rice and peas · Cabbage",
    pickup: "Order when you arrive. Pick it up on your way out.",
  },
  holidays: [
    {
      date: "2026-12-24",
      dateLabel: "Thursday, December 24, 2026",
      price: 20,
      title: "Christmas Eve Party",
      description: "A holiday edition at Irie Jerk Bar and Grill.",
      replacesWeekly: true,
    },
    {
      date: "2026-12-31",
      dateLabel: "Thursday, December 31, 2026",
      price: 40,
      title: "GQ Meets VOGUE Winter Ball",
      description: "Formalwear, red-carpet photography, and a Best Dressed runway. Ring in 2027.",
      replacesWeekly: true,
    },
  ],
  allEventsHref: "/events",
  icsHref: "/irie-jerk-and-juggling.ics",
  ogImage: "https://trcevent.com/og-irie-jerk-and-juggling.png",
};
