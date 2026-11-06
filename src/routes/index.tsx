import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Truck, Leaf, ShieldCheck, Gift, Cake, Heart, Gem, Smile, Briefcase, Star, Flame, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import hero from "@/assets/hero-cake.jpg";
import cupcake from "@/assets/cupcake.jpg";
import macarons from "@/assets/macarons.jpg";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductCard } from "@/components/site/ProductCard";
import { productsQuery } from "@/lib/catalog";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Maison Rosé — Handcrafted Cakes & Pastries" },
      { name: "description", content: "Order beautifully crafted cakes, macarons and pastries for every celebration, delivered fresh." },
      { property: "og:title", content: "Maison Rosé — Handcrafted Cakes & Pastries" },
      { property: "og:description", content: "Beautifully crafted cakes for every celebration, made with the finest ingredients." },
    ],
  }),
  component: Index,
});

const perks = [
  { icon: Truck, title: "Same-day delivery", sub: "Order before 2 PM" },
  { icon: Leaf, title: "Fresh ingredients", sub: "Premium & natural" },
  { icon: ShieldCheck, title: "Secure payment", sub: "Cash or card" },
  { icon: Gift, title: "Beautiful packaging", sub: "Made with care" },
];
const occasionIcons = [
  { name: "Birthday", icon: Cake },
  { name: "Anniversary", icon: Heart },
  { name: "Wedding", icon: Gem },
  { name: "Kids", icon: Smile },
  { name: "Corporate", icon: Briefcase },
] as const;

function SectionHead({ title, icon: Icon }: { title: string; icon?: typeof Flame }) {
  return (
    <div className="mb-6 flex items-end justify-between">
      <h2 className="flex items-center gap-2 text-2xl font-semibold sm:text-3xl">
        {title} {Icon && <Icon className="h-5 w-5 text-primary" />}
      </h2>
      <Link to="/shop" className="flex items-center gap-1.5 text-sm font-semibold hover:text-primary">
        View all <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function Index() {
  const products = useQuery(productsQuery).data ?? [];
  const best = products.filter((p) => p.tags.includes("bestseller")).slice(0, 4);
  const trending = products.filter((p) => p.tags.includes("trending"));
  const fresh = products.filter((p) => p.tags.includes("new"));
  const [email, setEmail] = useState("");

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero">
        <img src={hero} alt="White buttercream cake with fresh berries" width={1600} height={1008} className="absolute inset-0 h-full w-full object-cover object-right opacity-90 max-md:opacity-40" />
        <div className="container-x relative py-20 sm:py-28 lg:py-36">
          <div className="max-w-lg animate-rise">
            <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
              <Heart className="h-3.5 w-3.5 fill-primary" /> Fresh & delicious cakes
            </p>
            <h1 className="text-5xl font-semibold leading-[1.05] sm:text-6xl">
              Made with love, just for <em className="text-primary">you</em>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">Beautifully crafted cakes for every celebration, made with the finest ingredients.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-soft transition-transform hover:scale-105">
                Shop now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/shop" search={{ category: "cakes" }} className="inline-flex items-center rounded-full border border-border bg-card px-7 py-3.5 text-sm font-bold uppercase tracking-wider hover:border-primary">
                Custom cakes
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Perks */}
      <div className="container-x relative z-10 -mt-8">
        <div className="grid grid-cols-2 gap-4 rounded-2xl bg-card p-5 shadow-card lg:grid-cols-4">
          {perks.map(({ icon: Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blush text-primary"><Icon className="h-5 w-5" /></span>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <section className="container-x mt-20">
        <SectionHead title="Best Sellers" />
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {best.map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      </section>

      <section className="container-x mt-20">
        <SectionHead title="Trending Now" icon={Flame} />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
          {trending.map((p) => <ProductCard key={p.slug} product={p} compact />)}
        </div>
      </section>

      {/* Occasions */}
      <section className="container-x mt-20">
        <div className="grid grid-cols-3 gap-4 rounded-3xl bg-blush/60 p-6 sm:grid-cols-5 sm:p-8">
          {occasionIcons.map(({ name, icon: Icon }) => (
            <Link key={name} to="/shop" search={{ occasion: name }} className="group flex flex-col items-center gap-2 text-sm font-semibold">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-card text-primary shadow-card transition-transform group-hover:-translate-y-1"><Icon className="h-6 w-6" /></span>
              {name}
            </Link>
          ))}
        </div>
      </section>

      {/* Promo banners */}
      <section className="container-x mt-20 grid gap-6 md:grid-cols-2">
        {[
          { img: macarons, kicker: "This week", title: "Macaron boxes for the office", cta: "Shop macarons", search: { category: "macarons" } },
          { img: cupcake, kicker: "Kids' parties", title: "Cupcakes made for little hands", cta: "Shop cupcakes", search: { category: "cupcakes" } },
        ].map((b) => (
          <Link key={b.title} to="/shop" search={b.search} className="group grid grid-cols-[1fr_auto] items-center gap-4 overflow-hidden rounded-3xl bg-cream p-6 shadow-card">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest text-primary">{b.kicker}</p>
              <h3 className="mt-2 text-2xl font-semibold">{b.title}</h3>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold group-hover:text-primary">{b.cta} <ArrowRight className="h-4 w-4" /></span>
            </div>
            <img src={b.img} alt="" loading="lazy" width={816} height={816} className="h-32 w-32 rounded-2xl object-cover transition-transform group-hover:scale-105 sm:h-40 sm:w-40" />
          </Link>
        ))}
      </section>

      <section className="container-x mt-20">
        <SectionHead title="New Arrivals" icon={Sparkles} />
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {fresh.map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container-x mt-20">
        <h2 className="mb-8 text-center text-3xl font-semibold">Sweet words</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { q: "The strawberry shortcake was the star of my daughter's birthday. Light and not too sweet.", n: "Amira B." },
            { q: "Ordered the vintage heart cake for our anniversary — it looked exactly like the photo.", n: "Youssef & Lina" },
            { q: "Macaron boxes for our client meeting arrived on time and beautifully packed.", n: "Sarra K." },
          ].map((t) => (
            <figure key={t.n} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-gold text-gold" />)}</div>
              <blockquote className="mt-3 font-display text-lg italic">“{t.q}”</blockquote>
              <figcaption className="mt-4 text-sm font-semibold text-muted-foreground">— {t.n}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="mt-20 bg-blush">
        <div className="container-x grid items-center gap-6 py-12 md:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Stay sweet!</p>
            <h2 className="mt-2 text-3xl font-semibold">Subscribe & get 10% off</h2>
            <p className="mt-2 text-sm text-muted-foreground">Exclusive offers, new product alerts and sweet surprises in your inbox.</p>
          </div>
          <form
            className="flex gap-2 rounded-full bg-card p-1.5 shadow-card"
            onSubmit={(e) => {
              e.preventDefault();
              if (!/^\S+@\S+\.\S+$/.test(email)) { toast.error("Please enter a valid email"); return; }
              toast.info("Newsletter sign-up opens once the store database is connected (next phase).");
            }}
          >
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Enter your email" className="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none" />
            <button className="rounded-full bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground">Subscribe</button>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}
