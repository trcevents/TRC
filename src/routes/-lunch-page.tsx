// Shared by src/routes/lunch.tsx. The "-" prefix excludes this file from route
// generation (TanStack Router convention) — see src/routes/README.md.
//
// Lunch menu and online ordering. The order form appears only once the database
// says ordering is on (lunch_settings); otherwise the page asks people to call.
// Menu and prices: supabase/functions/lunch-order/menu.ts.
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { CalendarDays, Clock, Loader2, MapPin, Phone, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import logoSmall from "@/assets/irie-jerk-logo-720.webp";
import logoLarge from "@/assets/irie-jerk-logo-1440.webp";
import { venueLine } from "@/lib/thursday/calendar";
import { IRIE_JERK_JUGGLING } from "@/lib/thursday/irie-jerk-juggling-event";
import {
  BEANS,
  bowlPrice,
  bowlSteps,
  CHEESE,
  DEFAULT_BOWL,
  EXTRAS,
  isLunchTime,
  LUNCH_HOURS,
  MAX_BOWLS,
  PROTEINS,
  RICE,
  SAUCES,
  SIGNATURE_BOWLS,
  TOPPINGS,
  type Bowl,
} from "../../supabase/functions/lunch-order/menu";

const SITE_URL = "https://trcevent.com";
const PAGE_URL = `${SITE_URL}/lunch/`;
const TITLE = "Lunch at Irie Jerk | Jerk Bowls 7 Days a Week";
const DESCRIPTION = `Jerk Bowls at Irie Jerk Bar and Grill, Calumet Park. Lunch 7 days a week, ${LUNCH_HOURS.label}. Bowls $20, seafood $25.`;

// Same venue for every Irie Jerk page.
const VENUE = IRIE_JERK_JUGGLING.venue;
const ADDRESS = venueLine(IRIE_JERK_JUGGLING);

export function lunchHead() {
  return {
    meta: [
      { title: `${TITLE} | TRC Events` },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: PAGE_URL },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: PAGE_URL }],
  };
}

/** "off": not switched on, or its status couldn't be read. */
type Ordering = "checking" | "open" | "after-hours" | "off";

function useOrdering(): Ordering {
  const [state, setState] = useState<Ordering>("checking");

  useEffect(() => {
    let active = true;
    async function check() {
      const { data, error } = await supabase
        .from("lunch_settings")
        .select("accepting_orders")
        .maybeSingle();
      if (!active) return;
      if (error || !data?.accepting_orders) setState("off");
      else setState(isLunchTime() ? "open" : "after-hours");
    }
    check();
    const timer = window.setInterval(check, 60_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  return state;
}

function Choice({
  type,
  name,
  checked,
  onChange,
  children,
}: {
  type: "radio" | "checkbox";
  name: string;
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-colors ${
        checked ? "border-gold bg-gold/10" : "border-border hover:border-gold/50"
      }`}
    >
      <input
        type={type}
        name={name}
        checked={checked}
        onChange={onChange}
        className="size-4 shrink-0 accent-[var(--gold)]"
      />
      <span className="flex flex-1 items-center justify-between gap-2">{children}</span>
    </label>
  );
}

function Step({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="mt-8 first:mt-0">
      <legend className="eyebrow mb-3">{title}</legend>
      <div className="grid gap-2 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

const toggle = (list: string[], item: string) =>
  list.includes(item) ? list.filter((v) => v !== item) : [...list, item];

function newRequestId() {
  return crypto.randomUUID();
}

export function LunchPage() {
  const ordering = useOrdering();
  const canOrder = ordering === "open";
  const [bowl, setBowl] = useState<Bowl>(DEFAULT_BOWL);
  const [cart, setCart] = useState<Bowl[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState<"pickup" | "dine_in">("pickup");
  const [table, setTable] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState<{ ticket: number; total: number } | null>(null);
  // Kept until the order changes, so a retry can't create a second ticket.
  const requestId = useRef<string | null>(null);
  const builder = useRef<HTMLElement>(null);

  useEffect(() => {
    requestId.current = null;
  }, [cart, name, phone, service, table]);

  const total = cart.reduce((sum, item) => sum + bowlPrice(item), 0);
  const set = (change: Partial<Bowl>) => setBowl((b) => ({ ...b, ...change }));

  function pickSignature(next: Bowl) {
    setBowl({ ...next, toppings: [...next.toppings], extras: [...next.extras] });
    builder.current?.scrollIntoView({ behavior: "smooth" });
  }

  function addBowl() {
    setPlaced(null);
    setCart((items) => (items.length < MAX_BOWLS ? [...items, bowl] : items));
  }

  async function sendOrder(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      requestId.current ??= newRequestId();
      const { data, error: invokeError } = await supabase.functions.invoke("lunch-order", {
        body: { requestId: requestId.current, name, phone, service, table, bowls: cart },
      });
      if (invokeError || !data?.ok) {
        setError(data?.error ?? `Couldn't send your order. Please call ${VENUE.phone.display}.`);
        return;
      }
      setPlaced({ ticket: data.ticket, total: data.total });
      setCart([]);
    } catch {
      setError(`Couldn't send your order. Please call ${VENUE.phone.display}.`);
    } finally {
      setBusy(false);
    }
  }

  const callButton = (
    <Button asChild variant="gold" size="xl">
      <a href={`tel:${VENUE.phone.tel}`}>
        <Phone className="size-4" /> Call {VENUE.phone.display}
      </a>
    </Button>
  );

  return (
    <div>
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 sm:py-20">
          <p className="eyebrow mb-4">Lunch at</p>
          <h1 className="font-display text-5xl font-extrabold tracking-tight sm:text-6xl">
            <img
              src={logoLarge}
              srcSet={`${logoSmall} 720w, ${logoLarge} 1440w`}
              sizes="(min-width: 768px) 672px, 92vw"
              width={1440}
              height={228}
              alt="Irie Jerk Bar and Grill"
              className="mx-auto h-auto w-full max-w-2xl"
            />
            <span className="mt-4 block text-gradient-gold">Jerk Bowl</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Coconut, savory, smoky jerk, creamy cheese, fresh crunch, sweet pineapple and spicy jerk
            sauce. Build it your way.
          </p>
          <p className="mt-5 font-display text-2xl font-bold text-gold">
            Bowls $20 · Seafood $25
          </p>
          <div className="mx-auto mt-5 flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4 text-gold" /> 7 days a week
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4 text-gold" /> {LUNCH_HOURS.label}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4 text-gold" /> {VENUE.name}, {ADDRESS}
            </span>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {callButton}
            <Button asChild variant="goldOutline" size="xl">
              <a href={VENUE.mapsUrl} target="_blank" rel="noreferrer">
                <MapPin className="size-4" /> Get Directions
              </a>
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        {ordering !== "checking" && !canOrder && (
          <p role="status" className="mb-10 rounded-xl border border-gold/40 bg-gold/10 p-4 text-center text-sm">
            {ordering === "after-hours"
              ? `Online ordering is open during lunch, ${LUNCH_HOURS.label} Chicago time.`
              : `Call ${VENUE.phone.display} to order.`}
          </p>
        )}

        <section>
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Signature Bowls</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SIGNATURE_BOWLS.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => pickSignature(item.bowl)}
                className="rounded-xl border border-border bg-card p-5 text-left transition-colors hover:border-gold"
              >
                <span className="flex items-baseline justify-between gap-3">
                  <span className="font-display text-lg font-bold">{item.name}</span>
                  <span className="font-display text-lg font-bold text-gold">
                    ${bowlPrice(item.bowl)}
                  </span>
                </span>
                <span className="mt-2 block text-xs leading-relaxed text-muted-foreground">
                  {[
                    item.bowl.rice,
                    BEANS,
                    item.bowl.protein,
                    "Cheese",
                    ...item.bowl.toppings,
                    ...item.bowl.extras,
                    `${item.bowl.sauce} jerk sauce`,
                  ].join(" · ")}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section ref={builder} className="mt-16 scroll-mt-20">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Build Your Bowl</h2>
          <div className="mt-6 rounded-xl border border-border bg-card p-5 sm:p-6">
            <Step title="1. Rice">
              {RICE.map((rice) => (
                <Choice key={rice} type="radio" name="rice" checked={bowl.rice === rice} onChange={() => set({ rice })}>
                  {rice}
                </Choice>
              ))}
            </Step>
            <Step title="2. Black Beans">
              <Choice type="checkbox" name="beans" checked={bowl.beans} onChange={() => set({ beans: !bowl.beans })}>
                {BEANS}
              </Choice>
            </Step>
            <Step title="3. Grilled Jerk Protein">
              {PROTEINS.map((p) => (
                <Choice key={p.name} type="radio" name="protein" checked={bowl.protein === p.name} onChange={() => set({ protein: p.name })}>
                  <span>{p.name}</span>
                  <span className="font-semibold text-gold">${p.price}</span>
                </Choice>
              ))}
            </Step>
            <Step title="4. Cheese">
              <Choice type="checkbox" name="cheese" checked={bowl.cheese} onChange={() => set({ cheese: !bowl.cheese })}>
                {CHEESE}
              </Choice>
            </Step>
            <Step title="5. Fresh Toppings">
              {TOPPINGS.map((t) => (
                <Choice key={t} type="checkbox" name="toppings" checked={bowl.toppings.includes(t)} onChange={() => set({ toppings: toggle(bowl.toppings, t) })}>
                  {t}
                </Choice>
              ))}
            </Step>
            <Step title="6. Finishing Touches">
              {EXTRAS.map((x) => (
                <Choice key={x} type="checkbox" name="extras" checked={bowl.extras.includes(x)} onChange={() => set({ extras: toggle(bowl.extras, x) })}>
                  {x}
                </Choice>
              ))}
            </Step>
            <Step title="7. Jerk Sauce (on the side)">
              {SAUCES.map((sauce) => (
                <Choice key={sauce} type="radio" name="sauce" checked={bowl.sauce === sauce} onChange={() => set({ sauce })}>
                  {sauce}
                </Choice>
              ))}
            </Step>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
              <p className="font-display text-2xl font-bold">
                This bowl: <span className="text-gold">${bowlPrice(bowl)}</span>
              </p>
              {canOrder ? (
                <Button type="button" variant="gold" size="xl" onClick={addBowl} disabled={cart.length >= MAX_BOWLS}>
                  <Plus className="size-4" /> Add to Order
                </Button>
              ) : (
                callButton
              )}
            </div>
          </div>
        </section>

        {placed && (
          <section role="status" className="mt-10 rounded-xl border-2 border-gold bg-gold/10 p-6 text-center">
            <p className="eyebrow">Order sent to the kitchen</p>
            <p className="mt-2 font-display text-4xl font-extrabold text-gold">Ticket {placed.ticket}</p>
            <p className="mt-2 text-sm">
              Total ${placed.total}. Pay at Irie Jerk. Questions? Call{" "}
              {VENUE.phone.display}.
            </p>
          </section>
        )}

        {canOrder && cart.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">Your Order</h2>
            <form onSubmit={sendOrder} className="mt-6 rounded-xl border border-gold/40 bg-card p-5 sm:p-6">
              <ul className="divide-y divide-border">
                {cart.map((item, i) => (
                  <li key={i} className="flex items-start justify-between gap-3 py-3 first:pt-0">
                    <div>
                      <p className="font-semibold">
                        {item.protein} bowl · <span className="text-gold">${bowlPrice(item)}</span>
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {bowlSteps(item).map((s) => s.value).join(" · ")}
                      </p>
                    </div>
                    <Button type="button" variant="goldOutline" size="sm" aria-label={`Remove bowl ${i + 1}`} onClick={() => setCart((items) => items.filter((_, n) => n !== i))}>
                      <Trash2 className="size-4" />
                    </Button>
                  </li>
                ))}
              </ul>

              <div className="mt-5 grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
                <label className="text-sm">
                  Name
                  <Input required maxLength={60} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
                </label>
                <label className="text-sm">
                  Phone
                  <Input required type="tel" autoComplete="tel" maxLength={20} value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" />
                </label>
                <div className="grid grid-cols-2 gap-2 self-end">
                  <Choice type="radio" name="service" checked={service === "pickup"} onChange={() => setService("pickup")}>
                    Pick up
                  </Choice>
                  <Choice type="radio" name="service" checked={service === "dine_in"} onChange={() => setService("dine_in")}>
                    Dine in
                  </Choice>
                </div>
                {service === "dine_in" && (
                  <label className="text-sm">
                    Table number
                    <Input required maxLength={20} value={table} onChange={(e) => setTable(e.target.value)} className="mt-1" />
                  </label>
                )}
              </div>

              {error && (
                <p role="alert" className="mt-4 text-sm font-medium text-destructive">
                  {error}
                </p>
              )}

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <p className="font-display text-2xl font-bold">
                  Total: <span className="text-gold">${total}</span>
                </p>
                <Button type="submit" variant="gold" size="xl" disabled={busy}>
                  {busy && <Loader2 className="size-4 animate-spin" />}
                  Send Order to Kitchen
                </Button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Pay at Irie Jerk. We use your name and phone number for this order. See our{" "}
                <a href="/privacy" className="text-gold hover:underline">
                  Privacy Policy
                </a>
                .
              </p>
            </form>
          </section>
        )}
      </div>
    </div>
  );
}
