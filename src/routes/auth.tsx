import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";

const safePath = (p?: string) => (p && p.startsWith("/") && !p.startsWith("//") ? p : "/account");

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Sign in — Maison Rosé" },
      { name: "description", content: "Sign in or create your Maison Rosé account to order and track your cakes." },
      { property: "og:title", content: "Sign in — Maison Rosé" },
      { property: "og:description", content: "Sign in or create your Maison Rosé account." },
    ],
  }),
  component: AuthPage,
});

const GoogleG = () => (
  <svg aria-hidden="true" width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.240 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
);

function AuthPage() {
  const { redirect } = Route.useSearch();
  const target = safePath(redirect);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"in" | "up" | "forgot">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: target, replace: true });
  }, [user, target, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === "up") {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + target, data: { full_name: name } } });
        if (error) throw error;
        if (!data.session) toast.success("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        toast.success("We sent you a link to reset your password.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    sessionStorage.setItem("after-login", target);
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (r.error) toast.error("Google sign-in failed");
  };

  useEffect(() => {
    const saved = sessionStorage.getItem("after-login");
    if (user && saved) { sessionStorage.removeItem("after-login"); navigate({ to: safePath(saved), replace: true }); }
  }, [user, navigate]);

  const input = "w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary";
  return (
    <SiteLayout>
      <div className="container-x flex justify-center py-16">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-card">
          <h1 className="text-3xl font-semibold">{mode === "in" ? "Welcome back" : mode === "up" ? "Create your account" : "Reset password"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{mode === "forgot" ? "We'll email you a reset link." : "Order cakes and follow your orders."}</p>
          {mode !== "forgot" && (
            <>
              <button type="button" onClick={google} className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-full border border-border bg-background py-3 text-sm font-medium">
                <GoogleG /> Continue with Google
              </button>
              <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
            </>
          )}
          <form onSubmit={submit} className="space-y-3">
            {mode === "up" && <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className={input} />}
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={input} />
            {mode !== "forgot" && <input required minLength={6} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className={input} />}
            <button disabled={busy} className="w-full rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-60">
              {busy ? "Please wait…" : mode === "in" ? "Sign in" : mode === "up" ? "Create account" : "Send reset link"}
            </button>
          </form>
          <div className="mt-5 flex justify-between text-sm">
            {mode === "in" ? (
              <>
                <button onClick={() => setMode("up")} className="font-semibold text-primary">Create an account</button>
                <button onClick={() => setMode("forgot")} className="text-muted-foreground">Forgot password?</button>
              </>
            ) : (
              <button onClick={() => setMode("in")} className="font-semibold text-primary">Back to sign in</button>
            )}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
