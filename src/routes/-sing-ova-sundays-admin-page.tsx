// Shared by src/routes/sing-ova-sundays-admin.tsx. The "-" prefix excludes
// this file from route generation (TanStack Router convention) — see
// src/routes/README.md.
//
// Moderation queue for Sing Ova Sundays city admins (DJs/venue contacts).
// Closes a real gap: sos_pairings has no moderation gate on the public side
// -- a submission only becomes visible in the public feed once a city
// admin here approves it. Sign-in is an emailed 6-digit code (AdminCodeSignIn),
// which creates a normal Supabase Auth session. A city admin's
// row in sos_city_admins has city_id set to their one city; a super admin
// (city_id null) can see/manage every city and add other admins.
//
// The actual security boundary is the RLS policies on sos_pairings/
// sos_cities/sos_city_admins (checked against auth.email()), not anything
// enforced here client-side -- this page just doesn't show UI for actions
// the signed-in admin can't perform anyway.
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { CheckCircle2, Loader2, LogOut, Music, Trash2 } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { AdminCodeSignIn } from "@/components/site/AdminCodeSignIn";
import type {
  FunctionInvokeErrorLike,
  SosAdminProfile,
  SosCity,
  SosPairing,
  SosPairingStatus,
  StatusMessage,
} from "@/lib/sing-ova-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SITE_URL = "https://trcevent.com";

const STATUS_TABS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "played", label: "Played" },
  { value: "rejected", label: "Rejected" },
] as const;

export function singOvaSundaysAdminHead() {
  return {
    meta: [
      { title: "Sing Ova Sundays Admin — TRC Events" },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/sing-ova-sundays-admin/` }],
  };
}

async function extractFunctionErrorMessage(
  error: FunctionInvokeErrorLike | null | undefined,
): Promise<string | null> {
  if (!error || typeof error !== "object") return null;
  const context = error.context;
  if (context && typeof context.json === "function") {
    try {
      const body = await context.json();
      if (body && typeof body.error === "string") return body.error;
    } catch {
      // context body wasn't JSON -- fall through to error.message
    }
  }
  return typeof error.message === "string" ? error.message : null;
}

export function SingOvaSundaysAdminPage() {
  const [authSession, setAuthSession] = useState<Session | null | undefined>(undefined); // undefined = still checking
  const [profile, setProfile] = useState<SosAdminProfile | null>(null); // { name, city_id, city_slug }
  const [profileLoading, setProfileLoading] = useState(true);
  const [cities, setCities] = useState<SosCity[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<SosPairingStatus>("pending");
  const [queue, setQueue] = useState<SosPairing[]>([]);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminCityId, setNewAdminCityId] = useState("all");
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [addAdminMsg, setAddAdminMsg] = useState<StatusMessage | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthSession(data.session ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthSession(session ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!authSession) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }
    let cancelled = false;
    async function loadProfile() {
      setProfileLoading(true);
      const { data } = await supabase.rpc("sos_my_admin_profile");
      const row: SosAdminProfile | null | undefined = Array.isArray(data) ? data[0] : data;
      if (cancelled) return;
      setProfile(row ?? null);
      if (row) {
        if (row.city_id) {
          setSelectedCityId(row.city_id);
        } else {
          const { data: allCities } = await supabase
            .from("sos_cities")
            .select("*")
            .order("name");
          if (!cancelled) {
            setCities(allCities ?? []);
            if (allCities?.length) setSelectedCityId(allCities[0].id);
          }
        }
      }
      if (!cancelled) setProfileLoading(false);
    }
    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [authSession]);

  async function loadQueue() {
    if (!selectedCityId) return;
    setLoadingQueue(true);
    const { data } = await supabase
      .from("sos_pairings")
      .select("*")
      .eq("city_id", selectedCityId)
      .eq("status", statusFilter)
      .order("created_at", { ascending: false });
    setQueue(data ?? []);
    setLoadingQueue(false);
  }

  useEffect(() => {
    loadQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCityId, statusFilter]);

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  async function handleSetStatus(pairingId: string, status: SosPairingStatus) {
    setBusyId(pairingId);
    try {
      await supabase.from("sos_pairings").update({ status }).eq("id", pairingId);
      await loadQueue();
    } finally {
      setBusyId(null);
    }
  }

  async function handleAddAdmin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newAdminName.trim() || !newAdminEmail.trim()) {
      setAddAdminMsg({ text: "Enter a name and email.", ok: false });
      return;
    }
    setAddingAdmin(true);
    setAddAdminMsg(null);
    try {
      const { data, error } = await supabase.functions.invoke("create-sos-city-admin", {
        body: {
          name: newAdminName.trim(),
          email: newAdminEmail.trim(),
          cityId: newAdminCityId === "all" ? null : newAdminCityId,
        },
      });
      if (!data?.ok) {
        const message = data?.error ?? (error ? await extractFunctionErrorMessage(error) : null);
        setAddAdminMsg({ text: message ?? "Something went wrong.", ok: false });
        return;
      }
      setNewAdminName("");
      setNewAdminEmail("");
      setNewAdminCityId("all");
      setAddAdminMsg({ text: "Admin added -- they'll get a welcome email with sign-in steps.", ok: true });
    } finally {
      setAddingAdmin(false);
    }
  }

  if (authSession === undefined) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-gold" />
      </div>
    );
  }

  if (!authSession) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
        <h1 className="font-display mb-6 text-2xl font-bold">Sing Ova Sundays Admin</h1>
        <AdminCodeSignIn status="signed-out" prompt="Enter your admin email to get a 6-digit sign-in code." />
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-gold" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16 text-center sm:px-6">
        <p className="text-sm text-muted-foreground">
          You're signed in, but this account isn't on the Sing Ova Sundays admin roster.
        </p>
        <Button variant="goldOutline" size="sm" className="mt-4" onClick={handleSignOut}>
          <LogOut className="size-4" /> Sign Out
        </Button>
      </div>
    );
  }

  const isSuperAdmin = !profile.city_id;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Sing Ova Sundays Admin</h1>
          <p className="text-sm text-muted-foreground">
            Signed in as {profile.name} {isSuperAdmin ? "(all cities)" : `(${profile.city_name})`}
          </p>
        </div>
        <Button variant="goldOutline" size="sm" onClick={handleSignOut}>
          <LogOut className="size-4" /> Sign Out
        </Button>
      </div>

      {isSuperAdmin && cities.length > 0 && (
        <div className="mt-6 max-w-xs space-y-2">
          <Label htmlFor="city-picker">City</Label>
          <Select value={selectedCityId ?? undefined} onValueChange={setSelectedCityId}>
            <SelectTrigger id="city-picker">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {cities.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} {c.status === "pending" ? "(pending)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="mt-8 flex gap-2 border-b border-border">
        {STATUS_TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setStatusFilter(t.value)}
            className={`border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              statusFilter === t.value
                ? "border-gold text-gold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loadingQueue && (
        <div className="mt-8 flex justify-center">
          <Loader2 className="size-6 animate-spin text-gold" />
        </div>
      )}

      {!loadingQueue && queue.length === 0 && (
        <p className="mt-8 text-sm text-muted-foreground">Nothing in {statusFilter} right now.</p>
      )}

      <div className="mt-6 space-y-4">
        {queue.map((p) => (
          <div key={p.id} className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {p.direction === "rnb_to_reggae" ? "R&B → Reggae" : "Reggae → R&B"}
              {p.week_theme ? ` · ${p.week_theme}` : ""}
            </p>
            <p className="mt-1 font-display text-lg font-semibold">
              {p.original_artist} — "{p.original_title}" → {p.reggae_artist} — "{p.reggae_title}"
            </p>
            {p.note && <p className="mt-2 text-sm text-muted-foreground">{p.note}</p>}
            <p className="mt-2 text-xs text-muted-foreground">
              — {p.display_name} ({p.email})
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {statusFilter !== "approved" && (
                <Button
                  size="sm"
                  variant="gold"
                  disabled={busyId === p.id}
                  onClick={() => handleSetStatus(p.id, "approved")}
                >
                  <CheckCircle2 className="size-4" /> Approve
                </Button>
              )}
              {statusFilter !== "played" && (
                <Button
                  size="sm"
                  variant="goldOutline"
                  disabled={busyId === p.id}
                  onClick={() => handleSetStatus(p.id, "played")}
                >
                  <Music className="size-4" /> Mark Played
                </Button>
              )}
              {statusFilter !== "rejected" && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busyId === p.id}
                  onClick={() => handleSetStatus(p.id, "rejected")}
                >
                  <Trash2 className="size-4" /> Reject
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {isSuperAdmin && (
        <div className="mt-12 rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold">Manage Admins</h2>
          <form onSubmit={handleAddAdmin} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-admin-name">Name</Label>
                <Input
                  id="new-admin-name"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-admin-email">Email</Label>
                <Input
                  id="new-admin-email"
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="max-w-xs space-y-2">
              <Label htmlFor="new-admin-city">City</Label>
              <Select value={newAdminCityId} onValueChange={setNewAdminCityId}>
                <SelectTrigger id="new-admin-city">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All cities (super admin)</SelectItem>
                  {cities.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {addAdminMsg && (
              <p className={`text-sm ${addAdminMsg.ok ? "text-gold" : "text-destructive"}`}>
                {addAdminMsg.text}
              </p>
            )}
            <Button type="submit" variant="gold" disabled={addingAdmin}>
              {addingAdmin ? <Loader2 className="size-4 animate-spin" /> : null}
              Add Admin
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
