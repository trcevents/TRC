// Shared TypeScript shapes for the Sing Ova pages (/sing-ova hub,
// /sing-ova-sundays/$city chapter pages, /sing-ova-sundays-admin). The
// Supabase client in src/lib/supabase.ts is untyped (no generated Database
// types), so these describe the columns the pages actually read from each
// table/view -- not a full schema. Keep them in sync with the selects in
// those pages if columns are added.

// The client-side "remembered login" kept in localStorage by
// src/lib/sing-ova-session.ts. The token comes from verify-sos-code and is
// what the database functions check (migration 0025).
export interface SosSession {
  email: string;
  displayName: string;
  token: string;
}

// Inline success/failure message shown under a form.
export interface StatusMessage {
  text: string;
  ok: boolean;
}

export type SosPairingStatus = "pending" | "approved" | "played" | "rejected";

// A row of sos_cities (RLS: anon only sees `published` rows).
export interface SosCity {
  id: string;
  slug: string;
  name: string;
  status: string;
  launch_date: string | null; // plain 'YYYY-MM-DD'
  venue_name: string | null;
  venue_address: string | null;
  hours_label: string | null;
}

// A row of the sos_cities_public view -- just the non-sensitive columns,
// for ALL cities regardless of status.
export type SosCityPublic = Pick<SosCity, "id" | "slug" | "name" | "status">;

// One "Featuring the music of" entry inside sos_city_hero_slides.pairings.
export interface SosHeroSlidePairing {
  rnb: string;
  reggae: string;
  genres: string;
}

// A row of sos_city_hero_slides.
export interface SosHeroSlide {
  id: string;
  city_id: string;
  position: number;
  image_url: string;
  alt_text: string;
  pairings?: SosHeroSlidePairing[] | null;
}

// Columns of sos_pairings that the feeds render. city_id is left off the
// base so the chapter page's client-only optimistic echo (which never had a
// city_id) fits the same shape.
export interface SosPairingBase {
  id: string;
  display_name: string;
  original_artist: string;
  original_title: string;
  reggae_artist: string;
  reggae_title: string;
  direction: string; // "rnb_to_reggae" | "reggae_to_rnb"
  note: string | null;
  week_theme: string | null;
  status: string; // SosPairingStatus
  created_at: string;
}

// A full sos_pairings row, as city admins read it.
export interface SosPairing extends SosPairingBase {
  city_id: string;
  email: string;
}

// A row of the sos_feed() function the public pages use: no email.
export interface SosFeedRow extends SosPairingBase {
  city_id: string;
  city_name: string | null;
  city_slug: string | null;
  heart_count: number;
  mine: boolean;
}

// A feed row with the city nested, as the hub renders it.
export interface SosPairingWithCity extends SosFeedRow {
  sos_cities: { name: string; slug: string } | null;
}

// What the chapter page's feed renders: real rows plus locally-echoed
// pending submissions (flagged with _localOnly).
export type SosFeedPairing = SosPairingBase & { _localOnly?: boolean };

// The row returned by the sos_my_admin_profile() RPC.
export interface SosAdminProfile {
  name: string;
  city_id: string | null; // null = super admin (every city)
  city_name?: string | null;
  city_slug?: string | null;
}

// The shape of the `error` supabase.functions.invoke() hands back for a
// non-2xx response (FunctionsHttpError carries the raw Response as
// `context`). Only the bits extractFunctionErrorMessage() probes.
export interface FunctionInvokeErrorLike {
  context?: { json?: () => Promise<{ error?: unknown } | null> } | null;
  message?: unknown;
}

// Result of the verify-sos-code edge function call.
export interface VerifyCodeResult {
  valid: boolean;
  token?: string;
  message?: string | null;
}
