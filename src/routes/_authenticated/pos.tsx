import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice, productsQuery, type Product } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/pos")({
  head: () => ({
    meta: [
      { title: "Point of Sale — Maison Rosé" },
      { name: "description", content: "In-store checkout for walk-in customers." },
      { property: "og:title", content: "Point of Sale — Maison Rosé" },
      { property: "og:description", content: "In-store checkout for walk-in customers." },
    ],
  }),
  component: POS,
});

function POS() {
  const qc = useQueryClient();
  const { data: products = [] } = useQuery(productsQuery);
  const [lines, setLines] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);
  const bySlug = Object.fromEntries(products.map((p) => [p.slug, p])) as Record<string, Product>;
  const entries = Object.entries(lines).filter(([s, q]) => q > 0 && bySlug[s]);
  const total = entries.reduce((s, [slug, q]) => s + q * bySlug[slug]!.price, 0);
  const bump = (slug: string, d: number) => setLines((l) => ({ ...l, [slug]: Math.max(0, (l[slug] ?? 0) + d) }));

  const pay = async (method: "cash" | "card") => {
    setBusy(true);
    const { data, error } = await supabase.rpc("place_order", { p_items: entries.map(([slug, qty]) => ({ slug, qty })), p_channel: "pos", p_payment: method });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(`Sale #${(data as { order_number: number }).order_number} recorded`);
    setLines({});
    qc.invalidateQueries({ queryKey: ["products"] });
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  };

  return (
    <AdminShell>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {products.filter((p) => p.active).map((p) => (
            <button key={p.id} disabled={p.stock <= (lines[p.slug] ?? 0)} onClick={() => bump(p.slug, 1)} className="overflow-hidden rounded-2xl border border-border bg-card text-left shadow-card disabled:opacity-40">
              <img src={p.image} alt={p.name} className="aspect-square w-full object-cover" />
              <div className="p-3">
                <p className="truncate text-sm font-semibold">{p.name}</p>
                <p className="text-xs text-muted-foreground">{formatPrice(p.price)} · {p.stock} left</p>
              </div>
            </button>
          ))}
        </div>
        <aside className="h-fit space-y-3 rounded-2xl border border-border bg-card p-5 shadow-card lg:sticky lg:top-4">
          <h2 className="text-xl font-semibold">Current sale</h2>
          {entries.length === 0 && <p className="text-sm text-muted-foreground">Tap products to add them.</p>}
          {entries.map(([slug, q]) => (
            <div key={slug} className="flex items-center justify-between gap-2 text-sm">
              <span className="min-w-0 truncate">{bySlug[slug]!.name}</span>
              <span className="flex items-center gap-2">
                <button className="h-7 w-7 rounded-full border border-border" onClick={() => bump(slug, -1)}>−</button>
                {q}
                <button className="h-7 w-7 rounded-full border border-border" onClick={() => bump(slug, 1)}>+</button>
              </span>
            </div>
          ))}
          <div className="flex justify-between border-t border-border pt-3 text-lg font-bold"><span>Total</span><span>{formatPrice(total)}</span></div>
          <div className="grid grid-cols-2 gap-2">
            <button disabled={busy || !entries.length} onClick={() => pay("cash")} className="rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-50">Cash</button>
            <button disabled={busy || !entries.length} onClick={() => pay("card")} className="rounded-full border border-primary py-3 text-sm font-bold text-primary disabled:opacity-50">Card</button>
          </div>
        </aside>
      </div>
    </AdminShell>
  );
}
