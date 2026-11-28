// The lunch menu: the single source for the /lunch page, the kitchen screen and
// the lunch-order function (which re-checks every bowl and works out the price
// itself). Plain TypeScript with no imports, so both Vite and Deno can load it.
//
// Changing this file changes the website on the next push, but the function only
// picks it up when it is redeployed: supabase functions deploy lunch-order
//
// Prices (owner, 2026-11-27): $20, seafood $25. Any bowl with shrimp or salmon
// counts as seafood.

export const LUNCH_HOURS = {
  openMinute: 11 * 60,
  closeMinute: 15 * 60,
  label: "11 AM – 3 PM",
  timeZone: "America/Chicago",
} as const;

export const MAX_BOWLS = 10;

export const RICE = ["Coconut Rice & Peas", "Coconut Cilantro Rice"] as const;
export const BEANS = "Stewed Black Beans";
export const CHEESE = "Multicolor Shredded Cheese";

export const PROTEINS = [
  { name: "Jerk Chicken Breast", price: 20 },
  { name: "Jerk Steak", price: 20 },
  { name: "Jerk Shrimp", price: 25 },
  { name: "Jerk Salmon", price: 25 },
  { name: "Jerk Combo (Chicken + Shrimp + Steak)", price: 25 },
  { name: "Chicken + Shrimp Combo", price: 25 },
  { name: "Chicken + Steak Combo", price: 20 },
  { name: "Shrimp + Steak Combo", price: 25 },
  { name: "Jerk Salmon + Shrimp", price: 25 },
  { name: "Jerk Veggie Chunks", price: 20 },
] as const;

export const STANDARD_TOPPINGS = [
  "Shredded Lettuce",
  "Diced Tomato",
  "Fresh Cilantro",
  "Red Onion",
  "Fresh Pineapple",
] as const;
export const TOPPINGS = [...STANDARD_TOPPINGS, "Grilled / Roasted Corn", "Avocado"] as const;
export const EXTRAS = ["Toasted Coconut Flakes", "Mango-Scotch Bonnet Drizzle"] as const;
export const SAUCES = ["Mild", "Hot"] as const;

export type Bowl = {
  rice: string;
  beans: boolean;
  protein: string;
  cheese: boolean;
  toppings: string[];
  extras: string[];
  sauce: string;
};

export const DEFAULT_BOWL: Bowl = {
  rice: RICE[0],
  beans: true,
  protein: PROTEINS[0].name,
  cheese: true,
  toppings: [...STANDARD_TOPPINGS],
  extras: [],
  sauce: SAUCES[0],
};

const preset = (protein: string): Bowl => ({
  ...DEFAULT_BOWL,
  protein,
  toppings: [...STANDARD_TOPPINGS],
  extras: [],
});

export const BEM_BEM: Bowl = {
  ...DEFAULT_BOWL,
  protein: "Jerk Salmon + Shrimp",
  toppings: [...TOPPINGS],
  extras: [...EXTRAS],
  sauce: "Hot",
};

export const SIGNATURE_BOWLS: { name: string; bowl: Bowl }[] = [
  { name: "Bem Bem Bowl", bowl: BEM_BEM },
  { name: "Jerk Chicken Bowl", bowl: preset("Jerk Chicken Breast") },
  { name: "Jerk Shrimp Bowl", bowl: preset("Jerk Shrimp") },
  { name: "Jerk Steak Bowl", bowl: preset("Jerk Steak") },
  { name: "Jerk Combo Bowl", bowl: preset("Jerk Combo (Chicken + Shrimp + Steak)") },
];

export function bowlPrice(bowl: Pick<Bowl, "protein">): number {
  return PROTEINS.find((p) => p.name === bowl.protein)?.price ?? 0;
}

/** The kitchen's build steps, in assembly order. */
export function bowlSteps(bowl: Bowl): { label: string; value: string }[] {
  return [
    { label: "Rice", value: bowl.rice },
    { label: "Black Beans", value: bowl.beans ? BEANS : "NO beans" },
    { label: "Protein", value: bowl.protein },
    { label: "Cheese", value: bowl.cheese ? CHEESE : "NO cheese" },
    { label: "Fresh Toppings", value: bowl.toppings.join(", ") || "NO toppings" },
    ...(bowl.extras.length ? [{ label: "Finishing Touches", value: bowl.extras.join(", ") }] : []),
    { label: "Jerk Sauce", value: `${bowl.sauce} (on the side)` },
  ];
}

/** Returns a clean copy of a bowl, or null if anything in it isn't on the menu. */
export function parseBowl(input: unknown): Bowl | null {
  if (!input || typeof input !== "object") return null;
  const b = input as Record<string, unknown>;
  const oneOf = (value: unknown, list: readonly string[]) =>
    typeof value === "string" && list.includes(value);
  const subset = (value: unknown, list: readonly string[]) =>
    Array.isArray(value) && value.every((v) => oneOf(v, list));

  if (
    !oneOf(b.rice, RICE) ||
    !oneOf(b.protein, PROTEINS.map((p) => p.name)) ||
    !oneOf(b.sauce, SAUCES) ||
    typeof b.beans !== "boolean" ||
    typeof b.cheese !== "boolean" ||
    !subset(b.toppings, TOPPINGS) ||
    !subset(b.extras, EXTRAS)
  ) {
    return null;
  }
  const chosen = (list: readonly string[], value: unknown) =>
    list.filter((item) => (value as string[]).includes(item));
  return {
    rice: b.rice as string,
    beans: b.beans,
    protein: b.protein as string,
    cheese: b.cheese,
    toppings: chosen(TOPPINGS, b.toppings),
    extras: chosen(EXTRAS, b.extras),
    sauce: b.sauce as string,
  };
}

/** Minutes after midnight in Chicago. */
export function chicagoMinute(now: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: LUNCH_HOURS.timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return get("hour") * 60 + get("minute");
}

export function isLunchTime(now: Date = new Date()): boolean {
  const minute = chicagoMinute(now);
  return minute >= LUNCH_HOURS.openMinute && minute < LUNCH_HOURS.closeMinute;
}
