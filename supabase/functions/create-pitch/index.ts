// Admin-only: creates (or replaces the content of) one venue-pitch deck.
// Never called from a browser -- Stephen/Claude calls it directly, same
// CONTRACT_ADMIN_SECRET used by create-contract-invite and
// update-invite-known-email:
//
//   curl -X POST https://xdjbgcqaynnzykrglgnf.supabase.co/functions/v1/create-pitch \
//     -H "x-admin-secret: <CONTRACT_ADMIN_SECRET value>" \
//     -H "Content-Type: application/json" \
//     --data-binary @pitch-payload.json
//
// (Use a file, not an inline -d string, for any pitch with real punctuation
// like em-dashes -- inline curl payloads have mangled Unicode before.)
//
// Payload shape:
//   {
//     "slug": "example-lounge-dancehall-101",
//     "venueName": "Example Lounge",
//     "venueAddress": "123 Main St, Chicago, IL 60601",
//     "contactName": "Jane Doe",
//     "contactTitle": "Owner, Example Lounge",
//     "contactPhone": "(555) 555-0100",
//     "contactEmail": "owner@example.com",
//     "preparedByName": "TRC Events",
//     "preparedByOrg": "Ras Tafari Inc. | Marlon TRC",
//     "pitchDate": "2026-07-17",
//     "logoUrl": "https://.../pitch-assets/.../marlontrc.png",
//     "status": "draft",
//     "slides": [
//       { "layout": "cover", "heading": "...", "body": {...} },
//       ...
//     ]
//   }
//
// Re-running this with the same slug replaces that pitch's slides entirely
// (delete + reinsert) and updates its metadata -- so editing a deck is just
// calling this again with the corrected payload, not a separate endpoint.
// Only slug, venueName, and slides are required; everything else has a
// sensible blank/default (see migration 0020's column defaults).
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const CONTRACT_ADMIN_SECRET = Deno.env.get("CONTRACT_ADMIN_SECRET");

const STATUSES = ["draft", "sent", "accepted", "declined"];

const OPTIONAL_FIELDS = {
  venueAddress: "venue_address",
  contactName: "contact_name",
  contactTitle: "contact_title",
  contactPhone: "contact_phone",
  contactEmail: "contact_email",
  preparedByName: "prepared_by_name",
  preparedByOrg: "prepared_by_org",
  pitchDate: "pitch_date",
  logoUrl: "logo_url",
  status: "status",
};

const jsonHeaders = { "Content-Type": "application/json" };

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  if (req.headers.get("x-admin-secret") !== CONTRACT_ADMIN_SECRET) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: jsonHeaders,
    });
  }

  const body = await req.json();
  const { slug, venueName, slides } = body;
  if (!slug || !venueName || !Array.isArray(slides) || slides.length === 0) {
    return new Response(
      JSON.stringify({
        error: "Missing slug, venueName, or a non-empty slides array.",
      }),
      { status: 400, headers: jsonHeaders },
    );
  }
  if (body.status && !STATUSES.includes(body.status)) {
    return new Response(
      JSON.stringify({ error: `status must be one of: ${STATUSES.join(", ")}` }),
      { status: 400, headers: jsonHeaders },
    );
  }
  for (const slide of slides) {
    if (!slide.layout) {
      return new Response(
        JSON.stringify({ error: "Every slide needs a layout." }),
        { status: 400, headers: jsonHeaders },
      );
    }
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const pitchRow = { slug, venue_name: venueName, updated_at: new Date().toISOString() };
  for (const [jsonKey, column] of Object.entries(OPTIONAL_FIELDS)) {
    if (body[jsonKey] !== undefined && body[jsonKey] !== null) {
      pitchRow[column] = body[jsonKey];
    }
  }

  const { data: pitch, error: pitchError } = await supabase
    .from("pitches")
    .upsert(pitchRow, { onConflict: "slug" })
    .select("id, slug")
    .single();

  if (pitchError || !pitch) {
    return new Response(
      JSON.stringify({ error: pitchError?.message ?? "Couldn't save the pitch." }),
      { status: 500, headers: jsonHeaders },
    );
  }

  const { error: deleteError } = await supabase
    .from("pitch_slides")
    .delete()
    .eq("pitch_id", pitch.id);
  if (deleteError) {
    return new Response(JSON.stringify({ error: deleteError.message }), {
      status: 500,
      headers: jsonHeaders,
    });
  }

  const slideRows = slides.map((slide, index) => ({
    pitch_id: pitch.id,
    position: index + 1,
    layout: slide.layout,
    kicker: slide.kicker ?? "",
    heading: slide.heading ?? "",
    subheading: slide.subheading ?? "",
    body: slide.body ?? [],
    image_url: slide.imageUrl ?? null,
  }));

  const { error: slidesError } = await supabase
    .from("pitch_slides")
    .insert(slideRows);

  if (slidesError) {
    return new Response(JSON.stringify({ error: slidesError.message }), {
      status: 500,
      headers: jsonHeaders,
    });
  }

  return new Response(
    JSON.stringify({
      ok: true,
      slug: pitch.slug,
      slideCount: slideRows.length,
      url: `https://trcevent.com/pitch/${pitch.slug}`,
    }),
    { status: 200, headers: jsonHeaders },
  );
});
