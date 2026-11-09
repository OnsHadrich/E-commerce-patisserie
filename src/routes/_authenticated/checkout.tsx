import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { DELIVERY_FEE, formatPrice, toOrderItems } from "@/lib/catalog";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Maison Rosé" },
      { name: "description", content: "Enter delivery details and place your pâtisserie order." },
      { property: "og:title", content: "Checkout — Maison Rosé" },
      { property: "og:description", content: "Enter delivery details and place your pâtisserie order." },
    ],
  }),
  component: CheckoutPage,
});

const input = "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary";

function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", phone: "", address: "", date: "", notes: "" });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.rpc("place_order", { p_items: toOrderItems(items), p_channel: "online", p_payment: "cash", p_customer: form });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    const res = data as { order_number: number };
    clear();
    qc.invalidateQueries({ queryKey: ["products"] });
    toast.success(`Order #${res.order_number} placed! We'll call you to confirm.`);
    navigate({ to: "/account" });
  };

  if (items.length === 0)
    return (
      <SiteLayout>
        <div className="container-x py-20 text-center">
          <p className="font-display text-2xl">Your cart is empty</p>
          <Link to="/shop" className="mt-5 inline-block rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground">Browse treats</Link>
        </div>
      </SiteLayout>
    );

  return (
    <SiteLayout>
      <form onSubmit={submit} className="container-x grid gap-8 py-12 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold">Checkout</h1>
          <input required placeholder="Full name" className={input} value={form.name} onChange={set("name")} />
          <input required placeholder="Phone" className={input} value={form.phone} onChange={set("phone")} />
          <input required placeholder="Delivery address" className={input} value={form.address} onChange={set("address")} />
          <label className="block text-sm font-semibold">Delivery date
            <input type="date" className={`${input} mt-1`} value={form.date} min={new Date().toISOString().slice(0, 10)} onChange={set("date")} />
          </label>
          <textarea placeholder="Notes (optional)" className={input} rows={3} value={form.notes} onChange={set("notes")} />
          <div className="rounded-2xl border border-primary bg-accent p-4 text-sm">
            <p className="font-semibold">Payment: cash on delivery</p>
            <p className="text-muted-foreground">Online card payment is coming soon.</p>
          </div>
        </div>
        <aside className="h-fit space-y-3 rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="text-xl font-semibold">Summary</h2>
          {items.map((i) => (
            <div key={i.key} className="flex justify-between text-sm"><span>{i.qty} × {i.name}</span><span>{formatPrice(i.qty * i.unitPrice)}</span></div>
          ))}
          <div className="flex justify-between border-t border-border pt-3 text-sm"><span>Delivery</span><span>{formatPrice(DELIVERY_FEE)}</span></div>
          <div className="flex justify-between text-lg font-bold"><span>Total</span><span>{formatPrice(subtotal + DELIVERY_FEE)}</span></div>
          <button disabled={busy} className="w-full rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-60">{busy ? "Placing order…" : "Place order"}</button>
        </aside>
      </form>
    </SiteLayout>
  );
}
