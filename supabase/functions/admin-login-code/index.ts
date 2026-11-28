// Password-free sign-in for TRC admins (comp admins and Sing Ova city admins)
// and Irie Jerk lunch staff.
//   { action: "request", email }       emails a 6-digit code to an active admin
//   { action: "verify", email, code }  checks it and returns a one-time token the
//                                      browser exchanges for a normal session
//                                      (supabase.auth.verifyOtp)
// Needs migrations 0023 and 0029.
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM = "TRC Events <hello@selassiefest.com>";
const CODE_TTL_MINUTES = 10;
const COOLDOWN_SECONDS = 60;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

function reply(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

async function sha256(text: string) {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function newCode() {
  const [n] = crypto.getRandomValues(new Uint32Array(1));
  return String(100000 + (n % 900000));
}

// The same answer whether or not the address belongs to an admin.
const REQUEST_OK = {
  ok: true,
  message: "If that email belongs to an admin, a code is on its way.",
};

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

  const body = await req.json().catch(() => null);
  const action = body?.action;
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || (action !== "request" && action !== "verify")) {
    return reply({ ok: false, error: "Invalid request." }, 400);
  }

  const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!);
  const [comp, sos, lunch] = await Promise.all([
    supabase.from("comp_admins").select("email").eq("active", true),
    supabase.from("sos_city_admins").select("email").eq("active", true),
    supabase.from("lunch_staff").select("email").eq("active", true),
  ]);
  const admin = [...(comp.data ?? []), ...(sos.data ?? []), ...(lunch.data ?? [])].some(
    (row) => String(row.email ?? "").toLowerCase() === email,
  );

  if (action === "request") {
    if (!admin) return reply(REQUEST_OK);

    const { data: existing } = await supabase
      .from("admin_login_codes")
      .select("created_at")
      .eq("email", email)
      .maybeSingle();
    if (
      existing &&
      Date.now() - new Date(existing.created_at).getTime() <
        COOLDOWN_SECONDS * 1000
    ) {
      return reply(REQUEST_OK);
    }

    const code = newCode();
    const now = Date.now();
    const { error: dbError } = await supabase.from("admin_login_codes").upsert(
      {
        email,
        code_hash: await sha256(code),
        attempts: 0,
        created_at: new Date(now).toISOString(),
        expires_at: new Date(now + CODE_TTL_MINUTES * 60 * 1000).toISOString(),
      },
      { onConflict: "email" },
    );
    if (dbError) {
      console.error("admin_login_codes upsert failed:", dbError);
      return reply({ ok: false, error: "Couldn't create a code. Try again." }, 500);
    }

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [email],
        subject: "Your TRC Events sign-in code",
        html: `
          <p>Your TRC Events sign-in code:</p>
          <p style="font-size:28px;font-weight:700;letter-spacing:4px;">${code}</p>
          <p>It expires in ${CODE_TTL_MINUTES} minutes and works once.</p>
          <p style="margin-top:24px;color:#888;font-size:0.85rem;">If you didn't request this, you can ignore it.</p>
        `,
      }),
    });
    if (!emailRes.ok) {
      console.error("Resend send failed:", emailRes.status, await emailRes.text());
    }
    return reply(REQUEST_OK);
  }

  const badCode = {
    ok: false,
    error: "That code is wrong or expired. Request a new one if needed.",
  };
  const code = String(body.code ?? "").trim();
  if (!admin || !/^\d{6}$/.test(code)) return reply(badCode);

  const { data: matched, error: tryError } = await supabase.rpc(
    "admin_login_try",
    { p_email: email, p_code_hash: await sha256(code) },
  );
  if (tryError) {
    console.error("admin_login_try failed:", tryError);
    return reply({ ok: false, error: "Couldn't check the code. Try again." }, 500);
  }
  if (!matched) return reply(badCode);

  // Creates a sign-in token without sending any email.
  const { data: link, error: linkError } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  if (linkError || !link?.properties?.hashed_token) {
    console.error("generateLink failed:", linkError);
    return reply({ ok: false, error: "Couldn't sign you in. Try again." }, 500);
  }

  return reply({
    ok: true,
    tokenHash: link.properties.hashed_token,
    type: link.properties.verification_type,
  });
});
