import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account — Maison Rosé" },
      { name: "description", content: "My Account at Maison Rosé Pâtisserie." },
      { property: "og:title", content: "My Account — Maison Rosé" },
      { property: "og:description", content: "My Account at Maison Rosé Pâtisserie." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <div className="container-x py-20 text-center">
        <h1 className="text-4xl font-semibold">My Account</h1>
        <p className="mt-3 text-muted-foreground">This page is coming in the next phase.</p>
        <Link to="/shop" className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground">Browse treats</Link>
      </div>
    </SiteLayout>
  );
}
