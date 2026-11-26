// Called from the Sing Ova Sundays admin page's "Manage Admins" screen
// (super admin only -- city_id is null on their sos_city_admins row).
// Clone of admin-create-person's account-provisioning half, retargeted at
// sos_city_admins and scoped to a specific city (or null for another
// super admin). New admin accounts get a random unused password; they sign in
// with an emailed 6-digit code (admin-login-code).
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM = "TRC Events <hello@selassiefest.com>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  const { name, email, cityId } = await req.json();
  if (!name || !email) {
    return new Response(JSON.stringify({ ok: false, error: "Need a name and email" }), { status: 400, headers: jsonHeaders });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // Bootstrap: this function normally requires a super-admin caller, but
  // that's impossible before any admin exists at all. Self-limiting escape
  // hatch -- only usable while sos_city_admins is genuinely empty, closes
  // itself permanently the moment the first admin (this call) is created.
  const { count: adminCount } = await admin
    .from("sos_city_admins")
    .select("id", { count: "exact", head: true });

  if (adminCount && adminCount > 0) {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ ok: false, error: "Missing Authorization header" }), { status: 401, headers: jsonHeaders });
    }
    // Check the caller is actually a super admin using THEIR OWN session --
    // this is what makes it safe to then use the service-role client below.
    const callerClient = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: authHeader } } });
    const { data: isSuperAdmin, error: rpcError } = await callerClient.rpc("sos_is_super_admin");
    if (rpcError || !isSuperAdmin) {
      return new Response(JSON.stringify({ ok: false, error: "Not authorized" }), { status: 403, headers: jsonHeaders });
    }
  }

  const { error: adminRowError } = await admin
    .from("sos_city_admins")
    .upsert(
      { name: name.trim(), email: normalizedEmail, city_id: cityId ?? null, active: true },
      { onConflict: "email" },
    );
  if (adminRowError) {
    return new Response(JSON.stringify({ ok: false, error: `Admin roster: ${adminRowError.message}` }), { status: 500, headers: jsonHeaders });
  }

  const { data: usersPage } = await admin.auth.admin.listUsers();
  let user = usersPage?.users.find((u) => (u.email || "").toLowerCase() === normalizedEmail);

  if (!user) {
    const randomPassword = crypto.randomUUID() + crypto.randomUUID();
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: normalizedEmail,
      password: randomPassword,
      email_confirm: true,
    });
    if (createError) {
      return new Response(JSON.stringify({ ok: false, error: `Account: ${createError.message}` }), { status: 500, headers: jsonHeaders });
    }
    user = created.user;
  }

  // Tell them how to sign in: they request a 6-digit code themselves.
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM,
      to: [email.trim()],
      subject: "You've been added to the Sing Ova Sundays admin team",
      html: `
        <p>Hi ${name.trim()},</p>
        <p>You've been added as an admin on the Sing Ova Sundays page.</p>
        <p>To sign in, go to <a href="https://trcevent.com/sing-ova-sundays-admin/">the sign-in page</a> and enter this email address. We'll email you a 6-digit code. There's no password.</p>
      `,
    }),
  });

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: jsonHeaders });
});
