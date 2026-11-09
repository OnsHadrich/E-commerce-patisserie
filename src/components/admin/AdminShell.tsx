import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth";

export function AdminShell({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) {
  const { loading, isStaff, isAdmin } = useAuth();
  const allowed = adminOnly ? isAdmin : isStaff;
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container-x flex h-14 items-center gap-6 text-sm font-semibold">
          <Link to="/" className="font-display text-lg">Maison Rosé</Link>
          <Link to="/admin" activeOptions={{ exact: true }} activeProps={{ className: "text-primary" }}>Orders</Link>
          {isAdmin && <Link to="/admin/products" activeProps={{ className: "text-primary" }}>Products</Link>}
          <Link to="/pos" activeProps={{ className: "text-primary" }}>POS</Link>
        </div>
      </header>
      <main className="container-x py-8">
        {loading ? <p className="text-muted-foreground">Loading…</p> : allowed ? children : <p className="text-muted-foreground">You don't have access to this page.</p>}
      </main>
    </div>
  );
}
