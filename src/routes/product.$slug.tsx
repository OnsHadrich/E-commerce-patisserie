import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Minus, Plus, Star, ChevronLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { flavors, formatPrice, getProduct, sizes, toppings } from "@/lib/catalog";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    const t = loaderData ? `${loaderData.product.name} — Maison Rosé` : "Product — Maison Rosé";
    const d = loaderData?.product.description ?? "Handcrafted pâtisserie.";
    return { meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }] };
  },
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { add } = useCart();
  const [size, setSize] = useState(sizes[0].id);
  const [flavor, setFlavor] = useState(flavors[0].id);
  const [tops, setTops] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [notes, setNotes] = useState("");
  const [qty, setQty] = useState(1);

  const sz = sizes.find((x) => x.id === size)!;
  const fl = flavors.find((x) => x.id === flavor)!;
  const tp = toppings.filter((t) => tops.includes(t.id));
  const unit = product.price + (product.customizable ? sz.delta + fl.delta + tp.reduce((s, t) => s + t.delta, 0) : 0);
  const soldOut = product.stock <= 0;

  const opt = (active: boolean) => `rounded-xl border px-4 py-2.5 text-left text-sm transition-colors ${active ? "border-primary bg-accent text-accent-foreground" : "border-border bg-card hover:border-primary"}`;

  return (
    <SiteLayout>
      <div className="container-x py-10">
        <Link to="/shop" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"><ChevronLeft className="h-4 w-4" /> Back to shop</Link>
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="overflow-hidden rounded-3xl bg-cream shadow-card">
            <img src={product.image} alt={product.name} width={816} height={816} className="aspect-square w-full object-cover" />
          </div>
          <div className="animate-rise">
            <h1 className="text-4xl font-semibold">{product.name}</h1>
            <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Star className="h-4 w-4 fill-gold text-gold" /> {product.rating} · {product.reviews} reviews ·
              <span className={soldOut ? "text-destructive" : "text-success"}>{soldOut ? "Sold out" : `${product.stock} available`}</span>
            </div>
            <p className="mt-5 text-muted-foreground">{product.description}</p>
            <p className="mt-6 text-3xl font-bold text-primary">{formatPrice(unit)}</p>

            {product.customizable && (
              <div className="mt-8 space-y-6">
                <fieldset>
                  <legend className="mb-2 text-sm font-semibold">Size</legend>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {sizes.map((x) => <button key={x.id} className={opt(size === x.id)} onClick={() => setSize(x.id)}>{x.label}<span className="block text-xs text-muted-foreground">{x.delta ? `+${x.delta} TND` : "Included"}</span></button>)}
                  </div>
                </fieldset>
                <fieldset>
                  <legend className="mb-2 text-sm font-semibold">Flavor & filling</legend>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {flavors.map((x) => <button key={x.id} className={opt(flavor === x.id)} onClick={() => setFlavor(x.id)}>{x.label}<span className="block text-xs text-muted-foreground">{x.delta ? `+${x.delta} TND` : "Included"}</span></button>)}
                  </div>
                </fieldset>
                <fieldset>
                  <legend className="mb-2 text-sm font-semibold">Toppings & decorations</legend>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {toppings.map((x) => <button key={x.id} className={opt(tops.includes(x.id))} onClick={() => setTops(tops.includes(x.id) ? tops.filter((t) => t !== x.id) : [...tops, x.id])}>{x.label}<span className="block text-xs text-muted-foreground">+{x.delta} TND</span></button>)}
                  </div>
                </fieldset>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold">Message on cake <span className="font-normal text-muted-foreground">(max 40)</span></span>
                  <input maxLength={40} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Happy Birthday Lina!" className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold">Special instructions</span>
                  <textarea maxLength={300} value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Allergies, colours…" className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary" />
                </label>
              </div>
            )}

            <div className="mt-8 flex gap-3">
              <div className="flex items-center rounded-full border border-border bg-card">
                <button aria-label="Decrease" className="p-3" onClick={() => setQty(Math.max(1, qty - 1))}><Minus className="h-4 w-4" /></button>
                <span className="w-8 text-center font-semibold">{qty}</span>
                <button aria-label="Increase" className="p-3" onClick={() => setQty(Math.min(product.stock || 1, qty + 1))}><Plus className="h-4 w-4" /></button>
              </div>
              <button
                disabled={soldOut}
                onClick={() => {
                  const options = product.customizable ? [sz.label, fl.label, ...tp.map((t) => t.label), ...(notes ? [`Note: ${notes}`] : [])] : [];
                  add({ slug: product.slug, name: product.name, image: product.image, unitPrice: unit, options, message: message || undefined }, qty);
                  toast.success("Added to your cart");
                }}
                className="flex-1 rounded-full bg-primary py-3.5 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-soft transition-transform hover:scale-[1.02] disabled:opacity-40"
              >
                {soldOut ? "Sold out" : `Add to cart · ${formatPrice(unit * qty)}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
