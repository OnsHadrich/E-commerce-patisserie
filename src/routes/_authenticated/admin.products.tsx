import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { bundledImageKeys, categories, formatPrice, productsQuery, type Product } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/admin/products")({
  head: () => ({
    meta: [
      { title: "Products — Maison Rosé Admin" },
      { name: "description", content: "Add and edit cakes, prices and stock." },
      { property: "og:title", content: "Products — Maison Rosé Admin" },
      { property: "og:description", content: "Add and edit cakes, prices and stock." },
    ],
  }),
  component: AdminProducts,
});

const blank = { slug: "", name: "", category: "cakes", price: 0, stock: 0, image: "cupcake", description: "", customizable: false, active: true };
type Form = typeof blank & { id?: string };
const cls = "rounded-xl border border-input bg-background px-3 py-2 text-sm";

function AdminProducts() {
  const qc = useQueryClient();
  const { data: products = [] } = useQuery(productsQuery);
  const [form, setForm] = useState<Form | null>(null);

  const edit = (p: Product) => setForm({ id: p.id, slug: p.slug, name: p.name, category: p.category, price: p.price, stock: p.stock, image: p.imageKey, description: p.description, customizable: p.customizable, active: p.active });
  const save = async () => {
    if (!form) return undefined;
    const { id, ...row } = form;
    const payload = { ...row, slug: row.slug || row.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") };
    const { error } = id ? await supabase.from("products").update(payload).eq("id", id) : await supabase.from("products").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
    setForm(null);
    qc.invalidateQueries({ queryKey: ["products"] });
  };

  return (
    <AdminShell adminOnly title="Products">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{products.length} items</p>
        <button onClick={() => setForm({ ...blank })} className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground">Add product</button>
      </div>
      {form && (
        <div className="mt-4 grid gap-3 rounded-2xl border border-primary bg-card p-5 sm:grid-cols-2">
          <input className={cls} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select className={cls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
          <label className="text-sm">Price<input type="number" min={0} step="0.5" className={`${cls} ml-2 w-28`} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></label>
          <label className="text-sm">Stock<input type="number" min={0} className={`${cls} ml-2 w-28`} value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} /></label>
          <select className={cls} value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })}>
            {bundledImageKeys.map((k) => <option key={k} value={k}>Photo: {k}</option>)}
          </select>
          <div className="flex gap-4 text-sm">
            <label><input type="checkbox" checked={form.customizable} onChange={(e) => setForm({ ...form, customizable: e.target.checked })} /> Customizable</label>
            <label><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Visible in shop</label>
          </div>
          <textarea className={`${cls} sm:col-span-2`} rows={2} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex gap-2 sm:col-span-2">
            <button onClick={save} className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground">Save</button>
            <button onClick={() => setForm(null)} className="rounded-full border border-border px-5 py-2 text-sm">Cancel</button>
          </div>
        </div>
      )}
      <ul className="mt-6 space-y-2">
        {products.map((p) => (
          <li key={p.id} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-3">
            <img src={p.image} alt={p.name} className="h-12 w-12 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{p.name} {!p.active && <span className="text-xs text-muted-foreground">(hidden)</span>}</p>
              <p className="text-xs text-muted-foreground">{formatPrice(p.price)} · stock {p.stock}</p>
            </div>
            <button onClick={() => edit(p)} className="rounded-full border border-border px-4 py-1.5 text-sm">Edit</button>
          </li>
        ))}
      </ul>
    </AdminShell>
  );
}
