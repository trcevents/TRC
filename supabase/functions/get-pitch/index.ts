// Public: powers the /pitch/:slug viewer on trcevent.com. Looks up a pitch
// deck by its slug and returns it with all its slides, ordered. No auth --
// this is meant to be an unlisted link handed to one external venue
// contact, not something requiring a login, but pitches/pitch_slides have
// zero anon read policies (see migration 0020) so this function is the
// only way to read them -- nobody can bulk-query every pitch via the
// public REST API using the anon key.
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  const { slug } = await req.json();
  if (!slug) {
    return new Response(JSON.stringify({ error: "Missing slug." }), {
      status: 400,
      headers: jsonHeaders,
    });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const { data: pitch, error: pitchError } = await supabase
    .from("pitches")
    .select(
      "id, slug, venue_name, venue_address, contact_name, contact_title, contact_phone, contact_email, prepared_by_name, prepared_by_org, pitch_date, logo_url, status",
    )
    .eq("slug", slug)
    .single();

  if (pitchError || !pitch) {
    return new Response(JSON.stringify({ error: "Pitch not found." }), {
      status: 404,
      headers: jsonHeaders,
    });
  }

  const { data: slides, error: slidesError } = await supabase
    .from("pitch_slides")
    .select("position, layout, kicker, heading, subheading, body, image_url")
    .eq("pitch_id", pitch.id)
    .order("position", { ascending: true });

  if (slidesError) {
    return new Response(JSON.stringify({ error: slidesError.message }), {
      status: 500,
      headers: jsonHeaders,
    });
  }

  const { id: _id, ...publicPitch } = pitch;
  return new Response(JSON.stringify({ pitch: publicPitch, slides }), {
    status: 200,
    headers: jsonHeaders,
  });
});
