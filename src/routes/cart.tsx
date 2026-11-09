import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { formatPrice } from "@/lib/catalog";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — Maison Rosé" },
      { name: "description", content: "Review the cakes and pastries in your cart." },
      { property: "og:title", content: "Your Cart — Maison Rosé" },
      { property: "og:description", content: "Review the cakes and pastries in your cart." },
    ],
  }),
  component: CartPage,
});

const DELIVERY_FEE = 7;

function CartPage() {
  const { items, setQty, remove, subtotal } = useCart();
  return (
    <SiteLayout>
      <div className="container-x py-12">
        <h1 className="text-4xl font-semibold">Your cart</h1>
        {items.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-border py-20 text-center">
            <ShoppingBag className="mx-auto h-10 w-10 text-primary" />
            <p className="mt-4 font-display text-2xl">Your cart is empty</p>
            <Link to="/shop" className="mt-5 inline-block rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground">Browse treats</Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <ul className="space-y-4">
              {items.map((i) => (
                <li key={i.key} className="grid grid-cols-[80px_minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-card">
                  <img src={i.image} alt={i.name} width={80} height={80} className="h-20 w-20 rounded-xl object-cover" />
                  <div className="min-w-0">
                    <Link to="/product/$slug" params={{ slug: i.slug }} className="font-semibold hover:text-primary">{i.name}</Link>
                    {i.options.length > 0 && <p className="truncate text-xs text-muted-foreground">{i.options.join(" · ")}</p>}
                    {i.message && <p className="text-xs italic text-muted-foreground">“{i.message}”</p>}
                    <p className="mt-1 text-sm font-bold">{formatPrice(i.unitPrice)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center rounded-full border border-border">
                      <button aria-label="Decrease" className="p-2" onClick={() => setQty(i.key, i.qty - 1)}><Minus className="h-3.5 w-3.5" /></button>
                      <span className="w-6 text-center text-sm font-semibold">{i.qty}</span>
                      <button aria-label="Increase" className="p-2" onClick={() => setQty(i.key, i.qty + 1)}><Plus className="h-3.5 w-3.5" /></button>
                    </div>
                    <button aria-label="Remove" onClick={() => remove(i.key)} className="text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </li>
              ))}
            </ul>
            <aside className="h-fit space-y-3 rounded-2xl border border-border bg-card p-6 shadow-card">
              <h2 className="text-xl font-semibold">Summary</h2>
              <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between text-sm"><span>Delivery</span><span>{formatPrice(DELIVERY_FEE)}</span></div>
              <div className="flex justify-between border-t border-border pt-3 text-lg font-bold"><span>Total</span><span>{formatPrice(subtotal + DELIVERY_FEE)}</span></div>
              <Link to="/checkout" className="block w-full rounded-full bg-primary py-3.5 text-center text-sm font-bold text-primary-foreground">Checkout</Link>
            </aside>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
