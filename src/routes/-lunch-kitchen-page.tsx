// Shared by src/routes/lunch_.kitchen.tsx. The "-" prefix excludes this file
// from route generation (TanStack Router convention) — see src/routes/README.md.
//
// Staff screen for online lunch orders: Kitchen line, Counter pickup and today's
// history. Sign-in is an emailed 6-digit code; Row Level Security
// (is_lunch_staff, migration 0029) is what actually protects the orders.
import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AdminCodeSignIn, useAdminStatus } from "@/components/site/AdminCodeSignIn";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { bowlSteps, type Bowl } from "../../supabase/functions/lunch-order/menu";

const REFRESH_MS = 8_000;
const LATE_MINUTES = 12;

type Status = "kitchen" | "ready" | "done" | "cancelled";
type Order = {
  id: string;
  ticket_no: number;
  customer_name: string;
  phone: string;
  service: "pickup" | "dine_in";
  table_label: string | null;
  items: (Bowl & { price: number })[];
  total: number;
  status: Status;
  checked: string[];
  created_at: string;
};

const TABS: { key: "kitchen" | "ready" | "history"; label: string }[] = [
  { key: "kitchen", label: "Kitchen Line" },
  { key: "ready", label: "Counter" },
  { key: "history", label: "History" },
];

export function lunchKitchenHead() {
  return {
    meta: [
      { title: "Lunch Orders (Staff) | TRC Events" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  };
}

const minutesSince = (iso: string) => Math.max(0, Math.floor((Date.now() - Date.parse(iso)) / 60000));

function chime(audio: AudioContext) {
  [880, 1175].forEach((frequency, i) => {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    const start = audio.currentTime + i * 0.25;
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.3, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);
    osc.connect(gain).connect(audio.destination);
    osc.start(start);
    osc.stop(start + 0.4);
  });
}

export function LunchKitchenPage() {
  const status = useAdminStatus("is_lunch_staff");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-extrabold">Lunch Orders</h1>
      <div className="mt-6">
        {status === "checking" ? (
          <Loader2 className="size-6 animate-spin text-gold" />
        ) : status === "admin" ? (
          <Board />
        ) : status === "signed-out" ? (
          <AdminCodeSignIn status={status} prompt="Staff: enter your email to get a 6-digit sign-in code." />
        ) : (
          <div className="rounded-xl border border-gold/40 bg-gold/10 p-4 text-sm">
            <p>This account isn't on the lunch staff list.</p>
            <Button variant="goldOutline" size="sm" className="mt-3" onClick={() => supabase.auth.signOut()}>
              Sign out
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Board() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [accepting, setAccepting] = useState<boolean | null>(null);
  const [stale, setStale] = useState(false);
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("kitchen");
  const [sound, setSound] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  const seen = useRef<Set<string> | null>(null);

  const load = useCallback(async () => {
    // Today's orders, plus anything unfinished from the last day.
    const since = new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString();
    const [list, settings] = await Promise.all([
      supabase
        .from("lunch_orders")
        .select("id, ticket_no, customer_name, phone, service, table_label, items, total, status, checked, created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: true }),
      supabase.from("lunch_settings").select("accepting_orders").maybeSingle(),
    ]);
    if (list.error || settings.error) {
      setStale(true);
      return;
    }
    setStale(false);
    setOrders(list.data as Order[]);
    setAccepting(settings.data?.accepting_orders ?? false);
  }, []);

  useEffect(() => {
    load();
    const timer = window.setInterval(load, REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [load]);

  useEffect(() => {
    if (!orders) return;
    const fresh = seen.current ? orders.filter((o) => !seen.current!.has(o.id)) : [];
    seen.current = new Set(orders.map((o) => o.id));
    if (fresh.length) {
      toast.info(`New order: ticket ${fresh.map((o) => o.ticket_no).join(", ")}`);
      if (sound && audio.current) chime(audio.current);
    }
  }, [orders, sound]);

  async function save(id: string, change: Partial<Pick<Order, "status" | "checked">>) {
    setOrders((list) => list?.map((o) => (o.id === id ? { ...o, ...change } : o)) ?? list);
    const { data, error } = await supabase
      .from("lunch_orders")
      .update({ ...change, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id");
    if (error || !data?.length) toast.error("Couldn't save that. Check the connection and try again.");
    load();
  }

  async function switchOrdering(next: boolean) {
    const { data, error } = await supabase
      .from("lunch_settings")
      .update({ accepting_orders: next })
      .eq("id", true)
      .select("id");
    if (error || !data?.length) toast.error("Couldn't change online ordering.");
    load();
  }

  function toggleSound() {
    if (!sound) {
      // Browsers only allow sound after a tap.
      audio.current ??= new AudioContext();
      audio.current.resume();
      chime(audio.current);
    }
    setSound(!sound);
  }

  if (!orders || accepting === null) {
    return stale ? (
      <p className="text-sm text-destructive">Couldn't load orders. Retrying…</p>
    ) : (
      <Loader2 className="size-6 animate-spin text-gold" />
    );
  }

  const inTab = (o: Order) =>
    tab === "history" ? o.status === "done" || o.status === "cancelled" : o.status === tab;
  const shown = orders.filter(inTab);
  if (tab === "history") shown.reverse();
  const count = (key: Status) => orders.filter((o) => o.status === key).length;

  return (
    <div>
      <div
        className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 ${
          accepting ? "border-gold/40 bg-gold/10" : "border-destructive/50 bg-destructive/10"
        }`}
      >
        <p className="text-sm font-medium">
          Online ordering is {accepting ? "ON (during lunch hours)" : "OFF"}. Keep this screen open
          while it is on; it's how new orders reach you.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant={accepting ? "goldOutline" : "gold"} size="sm" onClick={() => switchOrdering(!accepting)}>
            {accepting ? "Pause ordering" : "Start taking orders"}
          </Button>
          <Button variant="goldOutline" size="sm" onClick={toggleSound} aria-pressed={sound}>
            {sound ? <Bell className="size-4" /> : <BellOff className="size-4" />}
            Sound {sound ? "on" : "off"}
          </Button>
          <Button variant="goldOutline" size="sm" onClick={() => supabase.auth.signOut()}>
            Sign out
          </Button>
        </div>
      </div>

      {stale && (
        <p role="alert" className="mt-3 text-sm font-medium text-destructive">
          Connection problem: this list may be out of date. Retrying…
        </p>
      )}

      <div className="mt-6 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <Button key={t.key} variant={tab === t.key ? "gold" : "goldOutline"} size="sm" onClick={() => setTab(t.key)}>
            {t.label}
            {t.key !== "history" && ` (${count(t.key)})`}
          </Button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No tickets here.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((order) => (
            <Ticket key={order.id} order={order} tab={tab} save={save} />
          ))}
        </div>
      )}
    </div>
  );
}

function Ticket({
  order,
  tab,
  save,
}: {
  order: Order;
  tab: (typeof TABS)[number]["key"];
  save: (id: string, change: Partial<Pick<Order, "status" | "checked">>) => void;
}) {
  const age = minutesSince(order.created_at);
  const late = tab === "kitchen" && age >= LATE_MINUTES;

  function cancel() {
    if (window.confirm(`Cancel ticket ${order.ticket_no}?`)) save(order.id, { status: "cancelled" });
  }

  return (
    <article className={`flex flex-col gap-3 rounded-xl border bg-card p-4 ${late ? "border-destructive" : "border-border"}`}>
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-2xl font-bold text-gold">Ticket {order.ticket_no}</p>
          <p className="text-sm">
            {order.customer_name} ·{" "}
            {order.service === "dine_in" ? `Table ${order.table_label}` : "Pick up"}
          </p>
          <a href={`tel:+1${order.phone}`} className="text-sm text-muted-foreground hover:text-gold">
            ({order.phone.slice(0, 3)}) {order.phone.slice(3, 6)}-{order.phone.slice(6)}
          </a>
        </div>
        <p className={`text-xs ${late ? "font-bold text-destructive" : "text-muted-foreground"}`}>
          {age === 0 ? "just now" : `${age}m ago`}
        </p>
      </header>

      {order.items.map((bowl, b) => (
        <div key={b} className="border-t border-border pt-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Bowl {b + 1} of {order.items.length}
          </p>
          <ul className="mt-1 space-y-1 text-sm">
            {bowlSteps(bowl).map((step, s) => {
              const key = `${b}:${s}`;
              const done = order.checked.includes(key);
              const text = (
                <span className={done && tab === "kitchen" ? "line-through opacity-60" : ""}>
                  <strong>{step.label}:</strong> {step.value}
                </span>
              );
              return (
                <li key={key}>
                  {tab === "kitchen" ? (
                    <label className="flex cursor-pointer items-start gap-2 py-0.5">
                      <input
                        type="checkbox"
                        checked={done}
                        onChange={() =>
                          save(order.id, {
                            checked: done ? order.checked.filter((k) => k !== key) : [...order.checked, key],
                          })
                        }
                        className="mt-0.5 size-4 shrink-0 accent-[var(--gold)]"
                      />
                      {text}
                    </label>
                  ) : (
                    text
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      <footer className="mt-auto border-t border-border pt-3">
        <p className="mb-3 text-sm font-semibold">
          Collect ${order.total}
          {tab === "history" && ` · ${order.status === "done" ? "Delivered" : "Cancelled"}`}
        </p>
        <div className="flex flex-wrap gap-2">
          {tab === "kitchen" && (
            <Button variant="gold" size="sm" onClick={() => save(order.id, { status: "ready" })}>
              Ready for counter
            </Button>
          )}
          {tab === "ready" && (
            <>
              <Button variant="gold" size="sm" onClick={() => save(order.id, { status: "done" })}>
                Delivered
              </Button>
              <Button variant="goldOutline" size="sm" onClick={() => save(order.id, { status: "kitchen" })}>
                Back to kitchen
              </Button>
            </>
          )}
          {tab !== "history" && (
            <Button variant="goldOutline" size="sm" onClick={cancel}>
              Cancel
            </Button>
          )}
          {tab === "history" && (
            <Button variant="goldOutline" size="sm" onClick={() => save(order.id, { status: "ready" })}>
              Reopen
            </Button>
          )}
        </div>
      </footer>
    </article>
  );
}
