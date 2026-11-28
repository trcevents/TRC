// Takes an online lunch order from /lunch. The browser is not trusted: every
// bowl is re-checked against the menu, the price is worked out here, and orders
// are only accepted during lunch hours while staff have ordering switched on.
// Limits and ticket numbers are handled in the database (migration 0029).
// Customers pay at the restaurant; no payment is taken here.
import { createClient } from "npm:@supabase/supabase-js@2";
import { bowlPrice, isLunchTime, LUNCH_HOURS, MAX_BOWLS, parseBowl } from "./menu.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

// Refusals are sent with status 200 so the page can show the message.
function reply(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}
const refuse = (error: string) => reply({ ok: false, error });

const REFUSALS: Record<string, string> = {
  closed: "Online ordering is paused right now. Please call to order.",
  phone_limit: "That phone number has reached the order limit for this hour. Please call us.",
  busy: "We're getting a lot of orders right now. Please call to order.",
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return reply({ ok: false, error: "Invalid request." }, 400);

  const requestId = typeof body.requestId === "string" ? body.requestId : "";
  const name = typeof body.name === "string" ? body.name.trim().replace(/\s+/g, " ") : "";
  let phone = typeof body.phone === "string" ? body.phone.replace(/\D/g, "") : "";
  if (phone.length === 11 && phone.startsWith("1")) phone = phone.slice(1);
  const service = body.service === "dine_in" ? "dine_in" : "pickup";
  const table = typeof body.table === "string" ? body.table.trim() : "";

  if (!UUID.test(requestId)) return reply({ ok: false, error: "Invalid request." }, 400);
  if (name.length < 1 || name.length > 60) return refuse("Enter your name (up to 60 characters).");
  if (!/^[2-9]\d{9}$/.test(phone)) return refuse("Enter a 10-digit phone number.");
  if (service === "dine_in" && (table.length < 1 || table.length > 20)) {
    return refuse("Enter your table number.");
  }
  if (!Array.isArray(body.bowls) || body.bowls.length < 1 || body.bowls.length > MAX_BOWLS) {
    return refuse(`Add between 1 and ${MAX_BOWLS} bowls.`);
  }
  const bowls = body.bowls.map(parseBowl);
  if (bowls.some((b: unknown) => b === null)) {
    return refuse("The menu has changed. Refresh the page and build your order again.");
  }
  if (!isLunchTime()) {
    return refuse(`Online ordering is open during lunch, ${LUNCH_HOURS.label} Chicago time.`);
  }

  const items = bowls.map((bowl: NonNullable<ReturnType<typeof parseBowl>>) => ({
    ...bowl,
    price: bowlPrice(bowl),
  }));
  const total = items.reduce((sum: number, item: { price: number }) => sum + item.price, 0);

  const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!);
  const { data, error } = await supabase.rpc("place_lunch_order", {
    p_request_id: requestId,
    p_name: name,
    p_phone: phone,
    p_service: service,
    p_table: service === "dine_in" ? table : null,
    p_items: items,
    p_total: total,
  });
  if (error) {
    console.error("place_lunch_order failed:", error);
    return reply({ ok: false, error: "Couldn't send your order. Please call us." }, 500);
  }
  if (!data?.ok) return refuse(REFUSALS[data?.reason] ?? "Couldn't send your order. Please call us.");

  return reply({ ok: true, ticket: data.ticket, total: data.total });
});
