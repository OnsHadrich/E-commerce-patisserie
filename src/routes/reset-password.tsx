import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — Maison Rosé" },
      { name: "description", content: "Choose a new password for your Maison Rosé account." },
      { property: "og:title", content: "Set a new password — Maison Rosé" },
      { property: "og:description", content: "Choose a new password for your Maison Rosé account." },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  const [pw, setPw] = useState("");
  const navigate = useNavigate();
  return (
    <SiteLayout>
      <div className="container-x flex justify-center py-16">
        <form
          className="w-full max-w-md space-y-4 rounded-3xl border border-border bg-card p-8 shadow-card"
          onSubmit={async (e) => {
            e.preventDefault();
            const { error } = await supabase.auth.updateUser({ password: pw });
            if (error) return void toast.error(error.message);
            toast.success("Password updated");
            navigate({ to: "/account" });
          }}
        >
          <h1 className="text-3xl font-semibold">New password</h1>
          <input required minLength={6} type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="New password" className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary" />
          <button className="w-full rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground">Save password</button>
        </form>
      </div>
    </SiteLayout>
  );
}
