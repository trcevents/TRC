// Shared by src/routes/dancehall-101_.checkin.tsx. The "-" prefix excludes
// this file from route generation (TanStack Router convention) -- see
// src/routes/README.md. The trailing underscore opts this route out of
// nesting under dancehall-101.tsx -- see -charly-black-comp-page.tsx for why
// that matters.
//
// Migrated from selassiefest.com/dancehall101/checkin/index.html -- door
// staff tool. Sign-in is an emailed 6-digit code (AdminCodeSignIn), sent only
// to active comp admins and Sing Ova admins. dh101_check_in_ticket and
// dh101_door_checkin themselves are granted to any `authenticated` user; the
// base dh101_signups table stays locked down to those RPCs/views.
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { AdminCodeSignIn } from "@/components/site/AdminCodeSignIn";
import {
  checkInDh101Ticket,
  fetchDh101CheckedInCount,
  searchDh101ByName,
  type Dh101CheckInResult,
  type Dh101DoorRow,
} from "@/lib/dancehall101";
import {
  DH101_BG,
  DH101_BORDER,
  DH101_CARD,
  DH101_FONT_LINKS,
  DH101_TEXT,
  DH101_TEXT_DIM,
  Dh101Topbar,
  SITE_URL,
} from "./-dancehall-101-shared";

export function dancehall101CheckinHead() {
  return {
    meta: [
      { title: "Dancehall 101 — Door Check-In" },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/dancehall-101/checkin/` }, ...DH101_FONT_LINKS],
  };
}

const STATUS_LABEL: Record<Dh101CheckInResult["status"], string> = {
  checked_in: "Checked In ✓",
  already_checked_in: "Already Checked In",
  not_verified: "Not Yet Verified — Deny Entry",
  not_found: "Code Not Found",
};

const STATUS_COLOR: Record<Dh101CheckInResult["status"], string> = {
  checked_in: "#6dbe8f",
  already_checked_in: "#F2B705",
  not_verified: "#e0a85c",
  not_found: "#e08585",
};

function StaffLogin() {
  return (
    <div className="mx-auto mt-15 max-w-[420px]">
      <h2 className="mb-4.5 text-center text-[1.1rem]">Staff Login</h2>
      <AdminCodeSignIn status="signed-out" prompt="Enter your staff email to get a 6-digit sign-in code." />
    </div>
  );
}

function CheckinResultCard({ r }: { r: Dh101CheckInResult }) {
  return (
    <div
      className="mt-3.5 rounded-xl border p-4.5"
      style={{ background: DH101_CARD, borderColor: DH101_BORDER }}
    >
      <div className="mb-1.5 font-bold" style={{ color: STATUS_COLOR[r.status] }}>
        {STATUS_LABEL[r.status]}
      </div>
      {r.full_name && (
        <div>
          {r.full_name}
          {r.school_name ? ` — ${r.school_name}` : ""}
        </div>
      )}
      {r.ticket_id && (
        <div className="text-[0.82rem]" style={{ color: DH101_TEXT_DIM }}>
          {r.ticket_id}
        </div>
      )}
    </div>
  );
}

function CheckinPanel() {
  const [count, setCount] = useState(0);
  const [code, setCode] = useState("");
  const [codeResult, setCodeResult] = useState<Dh101CheckInResult | null>(null);
  const [codeError, setCodeError] = useState(false);
  const [checking, setChecking] = useState(false);
  const [nameQuery, setNameQuery] = useState("");
  const [nameResults, setNameResults] = useState<Dh101DoorRow[] | null>(null);
  const [checkingInTicket, setCheckingInTicket] = useState<string | null>(null);

  async function refreshCount() {
    try {
      setCount(await fetchDh101CheckedInCount());
    } catch (err) {
      console.error("Failed to refresh check-in count:", err);
    }
  }

  useEffect(() => {
    refreshCount();
  }, []);

  async function doCheckIn(rawCode: string) {
    setChecking(true);
    setCodeError(false);
    try {
      const r = await checkInDh101Ticket(rawCode);
      if (!r) {
        setCodeError(true);
        setCodeResult(null);
        return;
      }
      setCodeResult(r);
      if (r.status === "checked_in") refreshCount();
    } catch (err) {
      console.error("Check-in failed:", err);
      setCodeError(true);
      setCodeResult(null);
    } finally {
      setChecking(false);
    }
  }

  async function submitCode() {
    const trimmed = code.trim();
    if (!trimmed) return;
    await doCheckIn(trimmed);
    setCode("");
  }

  useEffect(() => {
    const q = nameQuery.trim();
    if (q.length < 2) {
      setNameResults(null);
      return;
    }
    const timer = setTimeout(() => {
      searchDh101ByName(q)
        .then(setNameResults)
        .catch((err) => console.error("Name search failed:", err));
    }, 250);
    return () => clearTimeout(timer);
  }, [nameQuery]);

  async function checkInFromSearch(row: Dh101DoorRow) {
    const ticketCode = row.ticket_id || row.redemption_code;
    if (!ticketCode) return;
    setCheckingInTicket(ticketCode);
    await doCheckIn(ticketCode);
    setCheckingInTicket(null);
  }

  return (
    <main className="mx-auto max-w-[640px] px-5 pt-7 pb-15">
      <div className="mb-4 text-right">
        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
          className="rounded-full border px-4 py-1.5 text-[0.8rem]"
          style={{ borderColor: DH101_BORDER, color: "#ccc" }}
        >
          Log out
        </button>
      </div>

      <div
        className="mb-5.5 rounded-[14px] border p-4 text-center"
        style={{ background: DH101_CARD, borderColor: DH101_BORDER }}
      >
        <div className="text-2xl font-bold" style={{ color: "var(--school-secondary, #F2B705)" }}>
          {count}
        </div>
        <div>Checked In Tonight</div>
      </div>

      <div className="flex gap-2.5">
        <input
          type="text"
          placeholder="Scan or type ticket ID / redemption code"
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submitCode()}
          className="flex-1 rounded-lg border bg-white/5 px-3.5 py-3 text-base outline-none"
          style={{ borderColor: DH101_BORDER, color: DH101_TEXT }}
        />
        <button
          type="button"
          onClick={submitCode}
          disabled={checking}
          className="rounded-lg px-5 font-bold text-white disabled:opacity-60"
          style={{ background: "var(--school-primary, #C8102E)" }}
        >
          {checking ? <Loader2 className="size-4 animate-spin" /> : "Check In"}
        </button>
      </div>
      {codeError && (
        <CheckinResultCard
          r={{
            status: "not_found",
            ticket_id: null,
            full_name: null,
            school_name: null,
            checked_in_at: null,
          }}
        />
      )}
      {codeResult && <CheckinResultCard r={codeResult} />}

      <div className="mt-6">
        <input
          type="text"
          placeholder="Or search by name…"
          value={nameQuery}
          onChange={(e) => setNameQuery(e.target.value)}
          className="w-full rounded-lg border bg-white/5 px-3.5 py-3 text-base outline-none"
          style={{ borderColor: DH101_BORDER, color: DH101_TEXT }}
        />
      </div>
      <div className="mt-5">
        {nameResults?.length === 0 && <p style={{ color: DH101_TEXT_DIM }}>No matches.</p>}
        {nameResults?.map((row) => (
          <div
            key={row.id}
            className="flex items-center justify-between gap-2.5 border-b py-2.5"
            style={{ borderColor: DH101_BORDER }}
          >
            <div className="text-[0.88rem]">
              {row.full_name}
              <div className="text-[0.78rem]" style={{ color: DH101_TEXT_DIM }}>
                {row.school_name}
                {row.is_verified ? "" : " — not verified"}
              </div>
            </div>
            <button
              type="button"
              disabled={
                row.checked_in || checkingInTicket === (row.ticket_id || row.redemption_code || "")
              }
              onClick={() => checkInFromSearch(row)}
              className="rounded-lg px-3.5 py-2 text-[0.82rem] text-white disabled:cursor-not-allowed disabled:opacity-50"
              style={{ background: "var(--school-primary, #C8102E)" }}
            >
              {row.checked_in ? "Checked In" : "Check In"}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}

export function Dancehall101CheckinPage() {
  const [signedIn, setSignedIn] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(!!session);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <div className="w-full" style={{ background: DH101_BG, color: DH101_TEXT }}>
      <Dh101Topbar tagline="Door Check-In" />
      {signedIn ? (
        <CheckinPanel />
      ) : (
        <div className="px-5 pb-15">
          <StaffLogin />
        </div>
      )}
    </div>
  );
}
