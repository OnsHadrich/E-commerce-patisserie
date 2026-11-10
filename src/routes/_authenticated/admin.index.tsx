import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/catalog";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Orders Dashboard — Maison Rosé" },
      { name: "description", content: "Manage incoming bakery orders and sales." },
      { property: "og:title", content: "Orders Dashboard — Maison Rosé" },
      { property: "og:description", content: "Manage incoming bakery orders and sales." },
    ],
  }),
  component: AdminOrders,
});

const STATUSES = ["pending", "preparing", "ready", "delivered", "completed", "cancelled"];

function AdminOrders() {
  const { isStaff } = useAuth();
  const qc = useQueryClient();
  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders"],
    enabled: isStaff,
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*, order_items(name, qty, options, message)").order("created_at", { ascending: false }).limit(200);
      if (error) throw error;
      return data;
    },
  });
  const today = new Date().toDateString();
  const todays = orders.filter((o) => new Date(o.created_at).toDateString() === today && o.status !== "cancelled");
  const revenue = todays.reduce((s, o) => s + Number(o.total), 0);
  const customers = new Set(orders.map((o) => o.phone || o.customer_name).filter(Boolean)).size;
  const open = orders.filter((o) => ["pending", "preparing", "ready"].includes(o.status)).length;

  const update = async (id: string, patch: { status?: string; payment_status?: string }) => {
    const { error } = await supabase.from("orders").update(patch).eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  };

  return (
    <AdminShell title="Orders overview">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[["Today's sales", formatPrice(revenue)], ["Today's orders", todays.length], ["Customers", customers], ["Open orders", open]].map(([l, v]) => (
          <div key={l as string} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <p className="text-sm text-muted-foreground">{l}</p>
            <p className="mt-1 text-2xl font-bold">{v}</p>
          </div>
        ))}
      </div>
      <h2 className="mt-8 text-2xl font-semibold">Recent orders</h2>
      <div className="mt-4 space-y-3">
        {orders.length === 0 && <p className="text-muted-foreground">No orders yet.</p>}
        {orders.map((o) => (
          <div key={o.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">#{o.order_number} · <span className="uppercase text-xs text-muted-foreground">{o.channel}</span> · {new Date(o.created_at).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{[o.customer_name, o.phone, o.address, o.delivery_date && `for ${o.delivery_date}`].filter(Boolean).join(" · ")}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">{formatPrice(Number(o.total))}</span>
                <button onClick={() => update(o.id, { payment_status: o.payment_status === "paid" ? "unpaid" : "paid" })} className={`rounded-full px-3 py-1 text-xs font-bold ${o.payment_status === "paid" ? "bg-primary text-primary-foreground" : "border border-border"}`}>
                  {o.payment_method} · {o.payment_status}
                </button>
                <select value={o.status} onChange={(e) => update(o.id, { status: e.target.value })} className="rounded-full border border-input bg-background px-3 py-1 text-sm capitalize">
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <ul className="mt-2 text-sm">
              {o.order_items.map((i, n) => (
                <li key={n}>{i.qty} × {i.name}{i.options.length > 0 && <span className="text-muted-foreground"> ({i.options.join(", ")})</span>}{i.message && <span className="italic"> “{i.message}”</span>}</li>
              ))}
            </ul>
            {o.notes && <p className="mt-1 text-xs text-muted-foreground">Note: {o.notes}</p>}
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
