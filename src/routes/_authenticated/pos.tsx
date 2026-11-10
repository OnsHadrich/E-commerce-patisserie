import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Minus, Trash2, Search } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { categories, formatPrice, productsQuery, type Product } from "@/lib/catalog";

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
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const bySlug = Object.fromEntries(products.map((p) => [p.slug, p])) as Record<string, Product>;
  const entries = Object.entries(lines).filter(([s, n]) => n > 0 && bySlug[s]);
  const total = entries.reduce((s, [slug, n]) => s + n * bySlug[slug]!.price, 0);
  const bump = (slug: string, d: number) => setLines((l) => ({ ...l, [slug]: Math.max(0, (l[slug] ?? 0) + d) }));
  const shown = products.filter((p) => p.active && (cat === "all" || p.category === cat) && p.name.toLowerCase().includes(q.toLowerCase()));

  const pay = async (method: "cash" | "card") => {
    setBusy(true);
    const { data, error } = await supabase.rpc("place_order", { p_items: entries.map(([slug, qty]) => ({ slug, qty })), p_channel: "pos", p_payment: method });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Sale #${(data as { order_number: number }).order_number} recorded`);
    setLines({});
    qc.invalidateQueries({ queryKey: ["products"] });
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  };

  const pill = (id: string, label: string) => (
    <button key={id} onClick={() => setCat(id)} className={`rounded-full px-4 py-2 text-sm font-semibold ${cat === id ? "bg-primary text-primary-foreground shadow-soft" : "bg-card border border-border"}`}>{label}</button>
  );

  return (
    <AdminShell title="POS Register">
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {pill("all", "All items")}
            {categories.map((c) => pill(c.slug, c.name))}
            <label className="ml-auto flex items-center gap-2 rounded-full border border-input bg-card px-3 py-2 text-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" className="w-36 bg-transparent outline-none" />
            </label>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {shown.map((p) => {
              const out = p.stock <= (lines[p.slug] ?? 0);
              return (
                <div key={p.id} className={`overflow-hidden rounded-2xl border border-border bg-card shadow-card ${out ? "opacity-40" : ""}`}>
                  <img src={p.image} alt={p.name} className="aspect-[4/3] w-full object-cover" />
                  <div className="flex items-end justify-between gap-2 p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{p.name}</p>
                      <p className="text-sm font-bold text-primary">{formatPrice(p.price)}</p>
                      <p className="text-xs text-muted-foreground">{p.stock} left</p>
                    </div>
                    <button aria-label={`Add ${p.name}`} disabled={out} onClick={() => bump(p.slug, 1)} className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"><Plus className="h-4 w-4" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <aside className="flex h-fit flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-card lg:sticky lg:top-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Current order</h2>
            <span className="rounded-full bg-blush px-3 py-1 text-xs font-semibold text-accent-foreground">Walk-in</span>
          </div>
          {entries.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Tap + on a product to add it.</p>}
          {entries.map(([slug, n]) => {
            const p = bySlug[slug]!;
            return (
              <div key={slug} className="flex items-center gap-3 text-sm">
                <img src={p.image} alt="" className="h-11 w-11 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{formatPrice(p.price * n)}</p>
                </div>
                <span className="flex items-center gap-1.5 rounded-full border border-border px-1">
                  <button aria-label="Less" className="p-1" onClick={() => bump(slug, -1)}><Minus className="h-3 w-3" /></button>
                  {n}
                  <button aria-label="More" className="p-1" disabled={p.stock <= n} onClick={() => bump(slug, 1)}><Plus className="h-3 w-3" /></button>
                </span>
                <button aria-label="Remove" onClick={() => bump(slug, -n)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            );
          })}
          <div className="flex justify-between border-t border-border pt-3 text-lg font-bold"><span>Total</span><span>{formatPrice(total)}</span></div>
          <button disabled={busy || !entries.length} onClick={() => pay("cash")} className="rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground shadow-soft disabled:opacity-50">Charge {formatPrice(total)} · Cash</button>
          <button disabled={busy || !entries.length} onClick={() => pay("card")} className="rounded-full border border-primary py-3 text-sm font-bold text-primary disabled:opacity-50">Pay by card</button>
          <button disabled={!entries.length} onClick={() => setLines({})} className="text-xs text-muted-foreground underline disabled:opacity-50">Clear order</button>
        </aside>
      </div>
    </AdminShell>
  );
}
