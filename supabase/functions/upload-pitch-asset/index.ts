// Admin-only: uploads one image (logo, slide photo) into the public
// pitch-assets storage bucket for a pitch deck. Exists because `supabase
// storage cp` errors out ("LegacyStorageUnsupportedOperationError") in this
// environment -- this is the workaround, and it's reusable for every future
// pitch's images too, not just this one. Never called from a browser:
//
//   curl -X POST https://xdjbgcqaynnzykrglgnf.supabase.co/functions/v1/upload-pitch-asset \
//     -H "x-admin-secret: <CONTRACT_ADMIN_SECRET value>" \
//     -H "Content-Type: application/json" \
//     --data-binary @upload-payload.json
//
// Payload: { "path": "example-lounge/marlontrc-logo.png",
//            "contentType": "image/png", "dataBase64": "..." }
// Returns the public URL to reference from create-pitch's logoUrl/imageUrl.
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const CONTRACT_ADMIN_SECRET = Deno.env.get("CONTRACT_ADMIN_SECRET");

const jsonHeaders = { "Content-Type": "application/json" };

function base64ToBytes(b64: string) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

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

  const { path, contentType, dataBase64 } = await req.json();
  if (!path || !contentType || !dataBase64) {
    return new Response(
      JSON.stringify({ error: "Missing path, contentType, or dataBase64." }),
      { status: 400, headers: jsonHeaders },
    );
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const bytes = base64ToBytes(dataBase64);

  const { error } = await supabase.storage
    .from("pitch-assets")
    .upload(path, bytes, { contentType, upsert: true });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: jsonHeaders,
    });
  }

  const { data } = supabase.storage.from("pitch-assets").getPublicUrl(path);

  return new Response(JSON.stringify({ ok: true, publicUrl: data.publicUrl }), {
    status: 200,
    headers: jsonHeaders,
  });
});
