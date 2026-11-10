import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { z } from "zod";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductCard } from "@/components/site/ProductCard";
import { categories, occasions, productsQuery } from "@/lib/catalog";
import { useQuery } from "@tanstack/react-query";

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  occasion: z.string().optional(),
  max: z.number().optional(),
  sort: z.enum(["popular", "price-asc", "price-desc"]).optional(),
});

export const Route = createFileRoute("/shop")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Shop Cakes & Pastries — Maison Rosé" },
      { name: "description", content: "Browse handcrafted cakes, macarons and cupcakes. Filter by category, occasion and price." },
      { property: "og:title", content: "Shop — Maison Rosé" },
      { property: "og:description", content: "Browse handcrafted cakes, macarons and cupcakes." },
    ],
  }),
  component: Shop,
});

function Shop() {
  const s = Route.useSearch();
  const { data: products = [], isLoading } = useQuery(productsQuery);
  const navigate = useNavigate({ from: "/shop" });
  const set = (patch: Partial<z.infer<typeof searchSchema>>) => navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });

  let list = products.filter((p) =>
    (!s.q || p.name.toLowerCase().includes(s.q.toLowerCase())) &&
    (!s.category || p.category === s.category) &&
    (!s.occasion || p.occasions.includes(s.occasion as never)) &&
    (!s.max || p.price <= s.max),
  );
  if (s.sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
  else if (s.sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
  else list = [...list].sort((a, b) => b.popularity - a.popularity);

  return (
    <SiteLayout>
      <section className="bg-hero py-14">
        <div className="container-x">
          <h1 className="text-4xl font-semibold sm:text-5xl">{s.occasion ? `${s.occasion} treats` : categories.find((c) => c.slug === s.category)?.name ?? "Our pâtisserie"}</h1>
          <p className="mt-2 text-muted-foreground">Baked fresh each morning, finished by hand.</p>
        </div>
      </section>

      <div className="container-x mt-8 space-y-5">
        <div className="flex flex-col gap-3 md:flex-row">
          <label className="flex flex-1 items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input defaultValue={s.q} onChange={(e) => set({ q: e.target.value || undefined })} placeholder="Search cakes, macarons…" className="w-full bg-transparent text-sm outline-none" />
          </label>
          <select value={s.max ?? ""} onChange={(e) => set({ max: e.target.value ? Number(e.target.value) : undefined })} className="rounded-full border border-border bg-card px-4 py-2.5 text-sm">
            <option value="">Any price</option>
            <option value="40">Up to 40 TND</option>
            <option value="90">Up to 90 TND</option>
          </select>
          <select value={s.sort ?? "popular"} onChange={(e) => set({ sort: e.target.value as "popular" })} className="rounded-full border border-border bg-card px-4 py-2.5 text-sm">
            <option value="popular">Most popular</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={s.category ?? ""}
            onChange={(e) => set({ category: e.target.value || undefined })}
            aria-label="Category"
            className="rounded-full border border-border bg-card px-4 py-2.5 text-sm"
          >
            <option value="">All categories</option>
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
          <select
            value={s.occasion ?? ""}
            onChange={(e) => set({ occasion: e.target.value || undefined })}
            aria-label="Occasion"
            className="rounded-full border border-border bg-card px-4 py-2.5 text-sm"
          >
            <option value="">All occasions</option>
            {occasions.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        {isLoading ? (
          <p className="py-20 text-center text-muted-foreground">Loading treats…</p>
        ) : list.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border py-20 text-center">
            <p className="font-display text-2xl">No treats match these filters</p>
            <Link to="/shop" className="mt-3 inline-block text-sm font-semibold text-primary">Clear filters</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 pt-2 sm:gap-6 lg:grid-cols-4">
            {list.map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
