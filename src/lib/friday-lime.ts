// The Ultimate Friday Lime: the public facts, as printed on the flyers. Used by
// /friday-lime, the /events card and the Friday column of the weekly lineup.
//
// Not on the flyers: the 12 noon food start comes from the owner's venue
// paperwork. No first date or closing time is published.
export const FRIDAY_LIME = {
  name: "The Ultimate Friday Lime",
  path: "/friday-lime",
  presenter: "Prestige Promotions",
  description:
    "The Ultimate Friday Lime: every Friday at Irie Jerk Bar and Grill, Calumet Park. Jamaican dinners, DJs playing soca, dancehall, reggae, Afrobeats, amapiano and neo-soul, $20 after midnight.",
  coverLabel: "$20 after midnight",
  foodFrom: "12 noon",
  genres: ["Soca", "Dancehall", "Reggae", "Afrobeats", "Amapiano", "Neo-Soul"],
} as const;
