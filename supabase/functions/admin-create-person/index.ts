// Called from the "Manage Team" screen (super admin only). Adds someone
// as a reviewer (comp_admins), an approver (appears in the public form's
// "who told you" dropdown + gets a referral link), or both. New admin
// accounts get a random unused password; they sign in with an emailed
// 6-digit code (admin-login-code).
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

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ ok: false, error: "Missing Authorization header" }), { status: 401, headers: jsonHeaders });
  }

  const { name, email, asAdmin, asApprover } = await req.json();
  if (!name || !email || (!asAdmin && !asApprover)) {
    return new Response(JSON.stringify({ ok: false, error: "Need a name, email, and at least one of admin/approver" }), { status: 400, headers: jsonHeaders });
  }

  // Check the caller is actually a super admin using THEIR OWN session --
  // this is what makes it safe to then use the service-role client below.
  const callerClient = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: authHeader } } });
  const { data: isSuperAdmin, error: rpcError } = await callerClient.rpc("is_comp_super_admin");
  if (rpcError || !isSuperAdmin) {
    return new Response(JSON.stringify({ ok: false, error: "Not authorized" }), { status: 403, headers: jsonHeaders });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  if (asApprover) {
    const { error } = await admin.from("approvers").upsert({ name: name.trim(), active: true }, { onConflict: "name" });
    if (error) {
      return new Response(JSON.stringify({ ok: false, error: `Approver: ${error.message}` }), { status: 500, headers: jsonHeaders });
    }
  }

  if (asAdmin) {
    const { error: adminRowError } = await admin
      .from("comp_admins")
      .upsert({ name: name.trim(), email: normalizedEmail, active: true }, { onConflict: "email" });
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
        subject: "You've been added to the Charly Black comp admin team",
        html: `
          <p>Hi ${name.trim()},</p>
          <p>Stephen added you as a reviewer on the Charly Black comp ticket admin page.</p>
          <p>To sign in, go to <a href="https://trcevent.com/charly-black/comp-admin/">the sign-in page</a> and enter this email address. We'll email you a 6-digit code. There's no password.</p>
        `,
      }),
    });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: jsonHeaders });
});
