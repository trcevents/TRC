// Password-free admin sign-in: email a 6-digit code (admin-login-code), then
// exchange it for a normal Supabase session so Row Level Security applies.
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type AdminStatus = "checking" | "signed-out" | "not-admin" | "admin";

export function useAdminStatus(): AdminStatus {
  const [status, setStatus] = useState<AdminStatus>("checking");

  useEffect(() => {
    let active = true;
    async function check() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        if (active) setStatus("signed-out");
        return;
      }
      const { data: isAdmin } = await supabase.rpc("is_comp_admin");
      if (active) setStatus(isAdmin ? "admin" : "not-admin");
    }
    check();
    // Deferred: calling Supabase from inside this callback can deadlock the client.
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      setTimeout(check, 0);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return status;
}

export function AdminCodeSignIn({ status }: { status: AdminStatus }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function call(body: Record<string, string>) {
    const { data, error } = await supabase.functions.invoke("admin-login-code", { body });
    if (error || !data?.ok) {
      toast.error(data?.error ?? "Something went wrong. Try again.");
      return null;
    }
    return data;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (!codeSent) {
        const data = await call({ action: "request", email });
        if (data) {
          setCodeSent(true);
          toast.success(data.message);
        }
        return;
      }
      const data = await call({ action: "verify", email, code });
      if (!data) return;
      const { error } = await supabase.auth.verifyOtp({
        token_hash: data.tokenHash,
        type: data.type,
      });
      if (error) toast.error("Couldn't sign you in. Request a new code.");
      setCodeSent(false);
      setCode("");
    } catch {
      toast.error("Something went wrong. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  if (status === "checking") return null;

  const box = "rounded-xl border border-gold/40 bg-gold/10 p-4 text-sm";
  const field = "max-w-xs border-gray-400 bg-white text-black placeholder:text-gray-500";

  if (status !== "signed-out") {
    return (
      <div className={`${box} flex flex-wrap items-center justify-between gap-3`}>
        <span>
          {status === "admin"
            ? "Signed in as an admin. Editing is on."
            : "This account isn't an admin, so editing is off."}
        </span>
        <Button type="button" variant="goldOutline" size="sm" onClick={() => supabase.auth.signOut()}>
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={box}>
      <p className="font-medium">
        {codeSent
          ? "Enter the 6-digit code from your email."
          : "View only. Admins: enter your email to get a 6-digit sign-in code."}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {codeSent ? (
          <Input
            key="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            required
            value={code}
            onChange={(e) => setCode(e.target.value.trim())}
            placeholder="123456"
            aria-label="6-digit code"
            className={field}
          />
        ) : (
          <Input
            key="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your admin email"
            aria-label="Admin email"
            className={field}
          />
        )}
        <Button type="submit" variant="gold" size="sm" disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : null}
          {codeSent ? "Sign in" : "Send code"}
        </Button>
        {codeSent && (
          <Button type="button" variant="goldOutline" size="sm" onClick={() => setCodeSent(false)}>
            Start over
          </Button>
        )}
      </div>
    </form>
  );
}
