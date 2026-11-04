import { Link } from "@tanstack/react-router";
import { Search, User, ShoppingBag, Instagram, Facebook, Phone, Mail, MapPin, Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useCart } from "@/lib/cart";

const nav = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/shop", label: "Cakes", search: { category: "cakes" } },
  { to: "/occasions", label: "Occasions" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" },
] as const;

export function Logo() {
  return (
    <Link to="/" className="leading-none">
      <span className="font-display text-2xl font-semibold tracking-tight">
        Maison <span className="text-primary italic">Rosé</span>
      </span>
      <span className="block text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Pâtisserie</span>
    </Link>
  );
}

function Header() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="container-x flex h-18 items-center justify-between gap-4 py-4">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm font-medium lg:flex">
          {nav.map((n) => (
            <Link
              key={n.label}
              to={n.to}
              search={"search" in n ? n.search : undefined}
              activeOptions={{ exact: true, includeSearch: true }}
              activeProps={{ className: "text-primary" }}
              className="transition-colors hover:text-primary"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <Link to="/shop" aria-label="Search" className="rounded-full p-2.5 hover:bg-accent"><Search className="h-5 w-5" /></Link>
          <Link to="/account" aria-label="Account" className="rounded-full p-2.5 hover:bg-accent"><User className="h-5 w-5" /></Link>
          <Link to="/cart" aria-label="Cart" className="relative rounded-full p-2.5 hover:bg-accent">
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute right-0.5 top-0.5 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{count}</span>
            )}
          </Link>
          <button aria-label="Menu" onClick={() => setOpen(!open)} className="rounded-full p-2.5 hover:bg-accent lg:hidden">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="container-x flex flex-col gap-1 pb-4 lg:hidden">
          {nav.map((n) => (
            <Link key={n.label} to={n.to} search={"search" in n ? n.search : undefined} onClick={() => setOpen(false)} className="rounded-xl px-3 py-2.5 font-medium hover:bg-accent">
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-cream">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">Handcrafted cakes and French pastries, baked fresh every morning.</p>
          <div className="flex gap-2">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="rounded-full bg-card p-2 shadow-card hover:text-primary"><Instagram className="h-4 w-4" /></a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="rounded-full bg-card p-2 shadow-card hover:text-primary"><Facebook className="h-4 w-4" /></a>
          </div>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider">Shop</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/shop" className="hover:text-primary">All products</Link></li>
            <li><Link to="/shop" search={{ category: "cakes" }} className="hover:text-primary">Cakes</Link></li>
            <li><Link to="/occasions" className="hover:text-primary">Occasions</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-primary">About us</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
            <li><Link to="/account" className="hover:text-primary">My account</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider">Visit us</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2"><MapPin className="h-4 w-4 shrink-0 text-primary" /> 12 Rue des Roses, Tunis</li>
            <li className="flex gap-2"><Phone className="h-4 w-4 shrink-0 text-primary" /> +216 00 000 000</li>
            <li className="flex gap-2"><Mail className="h-4 w-4 shrink-0 text-primary" /> hello@maisonrose.tn</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} Maison Rosé Pâtisserie</div>
    </footer>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
