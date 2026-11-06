import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/catalog";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "My Account — Maison Rosé" },
      { name: "description", content: "Your Maison Rosé account and past orders." },
      { property: "og:title", content: "My Account — Maison Rosé" },
      { property: "og:description", content: "Your Maison Rosé account and past orders." },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: orders = [] } = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("id, order_number, status, total, created_at").eq("user_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  return (
    <SiteLayout>
      <div className="container-x py-12">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-semibold">My account</h1>
          <button
            className="rounded-full border border-border px-5 py-2 text-sm font-semibold"
            onClick={async () => {
              await qc.cancelQueries();
              qc.clear();
              await supabase.auth.signOut();
              navigate({ to: "/auth", search: {}, replace: true });
            }}
          >
            Sign out
          </button>
        </div>
        <p className="mt-2 text-muted-foreground">{user?.email}</p>
        <h2 className="mt-10 text-2xl font-semibold">My orders</h2>
        {orders.length === 0 ? (
          <p className="mt-4 text-muted-foreground">No orders yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {orders.map((o) => (
              <li key={o.id} className="flex justify-between rounded-2xl border border-border bg-card p-4">
                <span>#{o.order_number} · {new Date(o.created_at).toLocaleDateString()} · <span className="capitalize">{o.status}</span></span>
                <span className="font-bold">{formatPrice(Number(o.total))}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </SiteLayout>
  );
}
