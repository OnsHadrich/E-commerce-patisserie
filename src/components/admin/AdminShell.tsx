import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { ClipboardList, Store, Cake, ShoppingBag, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

const nav = [
  { to: "/admin", label: "Orders", icon: ClipboardList, exact: true, admin: false },
  { to: "/pos", label: "POS Register", icon: ShoppingBag, exact: false, admin: false },
  { to: "/admin/products", label: "Products", icon: Cake, exact: false, admin: true },
] as const;

export function AdminShell({ children, adminOnly = false, title }: { children: ReactNode; adminOnly?: boolean; title?: string }) {
  const { loading, isStaff, isAdmin, user } = useAuth();
  const allowed = adminOnly ? isAdmin : isStaff;
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => { setNow(new Date()); const t = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(t); }, []);
  const name = (user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? "";

  return (
    <div className="flex min-h-screen bg-cream">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-5 md:flex">
        <Link to="/" className="font-display text-2xl text-primary">Maison Rosé</Link>
        <p className="text-xs text-muted-foreground">POS & Bakery Admin</p>
        <nav className="mt-8 space-y-1 text-sm font-semibold">
          {nav.filter((n) => !n.admin || isAdmin).map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: n.exact }}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sidebar-foreground hover:bg-sidebar-accent"
              activeProps={{ className: "bg-primary text-primary-foreground hover:bg-primary shadow-soft" }}>
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto space-y-1 text-sm">
          <Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-sidebar-accent"><Store className="h-4 w-4" /> Storefront</Link>
          <button onClick={() => supabase.auth.signOut()} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-sidebar-accent"><LogOut className="h-4 w-4" /> Sign out</button>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex h-16 items-center justify-between gap-4 border-b border-border bg-card px-6">
          <div>
            <h1 className="text-xl font-semibold">{title}</h1>
            <nav className="flex gap-3 text-xs font-semibold md:hidden">
              {nav.filter((n) => !n.admin || isAdmin).map((n) => <Link key={n.to} to={n.to} activeOptions={{ exact: n.exact }} activeProps={{ className: "text-primary" }}>{n.label}</Link>)}
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden text-muted-foreground sm:inline">{now?.toLocaleString([], { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
            <span className="flex items-center gap-2 rounded-full bg-blush px-3 py-1.5">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{name.charAt(0).toUpperCase()}</span>
              <span className="hidden max-w-32 truncate font-semibold sm:inline">{name}</span>
              <span className="text-xs text-accent-foreground">{isAdmin ? "Admin" : "Staff"}</span>
            </span>
          </div>
        </header>
        <main className="p-6">
          {loading ? <p className="text-muted-foreground">Loading…</p> : allowed ? children : <p className="text-muted-foreground">You don't have access to this page.</p>}
        </main>
      </div>
    </div>
  );
}
