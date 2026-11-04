import { Link } from "@tanstack/react-router";
import { ShoppingBag, Star } from "lucide-react";
import { toast } from "sonner";
import { formatPrice, type Product } from "@/lib/catalog";
import { useCart } from "@/lib/cart";

export function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { add } = useCart();
  const soldOut = product.stock <= 0;
  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-soft">
      <Link to="/product/$slug" params={{ slug: product.slug }} className="relative block aspect-square overflow-hidden bg-cream">
        <img src={product.image} alt={product.name} loading="lazy" width={816} height={816} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        {product.tags.includes("bestseller") && !compact && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">Best seller</span>
        )}
        {soldOut && <span className="absolute right-3 top-3 rounded-full bg-foreground/80 px-2.5 py-1 text-[10px] font-bold uppercase text-background">Sold out</span>}
      </Link>
      <div className="flex items-end justify-between gap-3 p-4">
        <div className="min-w-0">
          <Link to="/product/$slug" params={{ slug: product.slug }} className="block truncate font-semibold hover:text-primary">{product.name}</Link>
          {!compact && (
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3.5 w-3.5 fill-gold text-gold" /> {product.rating} <span>({product.reviews})</span>
            </div>
          )}
          <p className="mt-1.5 font-bold">{formatPrice(product.price)}</p>
        </div>
        {!compact && (
          <button
            aria-label={`Add ${product.name} to cart`}
            disabled={soldOut}
            onClick={() => {
              add({ slug: product.slug, name: product.name, image: product.image, unitPrice: product.price, options: [] });
              toast.success(`${product.name} added to your cart`);
            }}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-110 disabled:opacity-40 disabled:hover:scale-100"
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        )}
      </div>
    </article>
  );
}
