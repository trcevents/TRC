// Data layer for Irie Jerk's weekly day+night activity lineup -- see
// supabase/sql/irie_jerk_weekly_lineup_schema.sql for the table and its
// source (the "Weekly Master (14 Activities)" tab). Read-only from the site;
// edits happen via SQL against irie_jerk_weekly_lineup directly.
import { supabase } from "@/lib/supabase";
import { FRIDAY_LIME } from "@/lib/friday-lime";

export type IrieJerkLineupRow = {
  slug: string;
  day_of_week: string;
  day_index: number;
  phase: "day" | "night";
  slot_order: number;
  name: string;
  time_window: string | null;
  description: string | null;
  signature_plate: string | null;
  signature_drinks: string | null;
  cover_charge: number | null;
  alcohol_free: boolean;
  is_flagship: boolean;
  is_monthly_special: boolean;
  is_21_plus: boolean;
  replaces_slug: string | null;
  detail_path: string | null;
  /** Replaces the cover/free text, for a cover that only applies part of the day. */
  cover_label?: string;
};

// Retired from the lineup (Karaoke Thursdays is gone; Thursdays are Irie Jerk &
// Juggling. Dancehall 101 is archived).
const REMOVED_SLUGS = [
  "karaoke-thursdays",
  "karaoke-after-dark",
  "dancehall101",
  "dancehall101-hospitality",
];

// Nights kept in code rather than in the table. They have their own pages.
const CODE_ROWS: IrieJerkLineupRow[] = [
  {
    slug: "friday-lime",
    day_of_week: "Fri",
    day_index: 5,
    phase: "night",
    slot_order: 12,
    name: FRIDAY_LIME.name,
    time_window: null,
    description: `${FRIDAY_LIME.foodLine} Jamaican dinners all night, and DJs from soca and dancehall to amapiano.`,
    signature_plate: null,
    signature_drinks: null,
    cover_charge: 20,
    cover_label: FRIDAY_LIME.coverLabel,
    alcohol_free: false,
    is_flagship: false,
    is_monthly_special: false,
    is_21_plus: false,
    replaces_slug: null,
    detail_path: FRIDAY_LIME.path,
  },
];

const LINEUP_COLUMNS =
  "slug, day_of_week, day_index, phase, slot_order, name, time_window, description, signature_plate, signature_drinks, cover_charge, alcohol_free, is_flagship, is_monthly_special, is_21_plus, replaces_slug, detail_path";

export async function fetchIrieJerkLineup(): Promise<IrieJerkLineupRow[]> {
  const { data, error } = await supabase
    .from("irie_jerk_weekly_lineup")
    .select(LINEUP_COLUMNS)
    .order("slot_order", { ascending: true })
    .order("is_monthly_special", { ascending: true });
  if (error) throw error;
  const rows = (data ?? []).filter((r) => !REMOVED_SLUGS.includes(r.slug));
  return [...rows, ...CODE_ROWS].sort((a, b) => a.slot_order - b.slot_order);
}

export async function fetchIrieJerkActivityBySlug(
  slug: string,
): Promise<IrieJerkLineupRow | null> {
  const { data, error } = await supabase
    .from("irie_jerk_weekly_lineup")
    .select(LINEUP_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data && !REMOVED_SLUGS.includes(data.slug) ? data : null;
}

export function irieJerkDetailHref(row: Pick<IrieJerkLineupRow, "slug" | "detail_path">) {
  return row.detail_path || `/irie-jerk/${row.slug}`;
}
