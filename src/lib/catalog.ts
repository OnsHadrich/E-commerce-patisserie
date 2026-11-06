import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import chocolate from "@/assets/cake-chocolate.jpg";
import strawberry from "@/assets/cake-strawberry.jpg";
import redvelvet from "@/assets/cake-redvelvet.jpg";
import heart from "@/assets/cake-heart.jpg";
import mango from "@/assets/cake-mango.jpg";
import macarons from "@/assets/macarons.jpg";
import cupcake from "@/assets/cupcake.jpg";

export const CURRENCY = "TND";
export const formatPrice = (n: number) => `${Number(n).toFixed(2)} ${CURRENCY}`;
export const DELIVERY_FEE = 7;

export type Category = { slug: string; name: string };
export const categories: Category[] = [
  { slug: "cakes", name: "Cakes" },
  { slug: "pastries", name: "Pastries" },
  { slug: "macarons", name: "Macarons" },
  { slug: "cupcakes", name: "Cupcakes" },
];

export const occasions = ["Birthday", "Anniversary", "Wedding", "Kids", "Corporate"] as const;
export type Occasion = (typeof occasions)[number];

const bundled: Record<string, string> = {
  "cake-chocolate": chocolate,
  "cake-strawberry": strawberry,
  "cake-redvelvet": redvelvet,
  "cake-heart": heart,
  "cake-mango": mango,
  macarons,
  cupcake,
};
export const bundledImageKeys = Object.keys(bundled);
export const imageFor = (key: string) => bundled[key] ?? (key || cupcake);

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  occasions: string[];
  price: number;
  image: string;
  imageKey: string;
  description: string;
  rating: number;
  reviews: number;
  popularity: number;
  stock: number;
  tags: string[];
  customizable: boolean;
  active: boolean;
};

type Row = {
  id: string; slug: string; name: string; category: string; occasions: string[]; price: number; image: string;
  description: string; rating: number; reviews: number; popularity: number; stock: number; tags: string[];
  customizable: boolean; active: boolean;
};
export const mapProduct = (r: Row): Product => ({
  ...r,
  price: Number(r.price),
  rating: Number(r.rating),
  imageKey: r.image,
  image: imageFor(r.image),
});

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: async () => {
    const { data, error } = await supabase.from("products").select("*").order("popularity", { ascending: false });
    if (error) throw error;
    return (data as Row[]).map(mapProduct);
  },
});

export const sizes = [
  { id: "s", label: "Small · 6 portions", delta: 0 },
  { id: "m", label: "Medium · 10 portions", delta: 30 },
  { id: "l", label: "Large · 16 portions", delta: 65 },
];
export const flavors = [
  { id: "vanilla", label: "Vanilla bean", delta: 0 },
  { id: "chocolate", label: "Dark chocolate", delta: 5 },
  { id: "pistachio", label: "Pistachio", delta: 12 },
];
export const toppings = [
  { id: "berries", label: "Fresh berries", delta: 10 },
  { id: "gold", label: "Gold leaf", delta: 15 },
  { id: "flowers", label: "Edible flowers", delta: 12 },
];

/** Builds the payload the database expects for each cart line. */
export const toOrderItems = (items: { slug: string; qty: number; message?: string | undefined; config?: ItemConfig | undefined }[]) =>
  items.map((i) => ({ slug: i.slug, qty: i.qty, message: i.message ?? "", ...(i.config ?? {}) }));

export type ItemConfig = { size: string; flavor: string; toppings: string[]; notes: string };
