// Phase 1 catalog. Will be replaced by database-backed products in Phase 2.
import chocolate from "@/assets/cake-chocolate.jpg";
import strawberry from "@/assets/cake-strawberry.jpg";
import redvelvet from "@/assets/cake-redvelvet.jpg";
import heart from "@/assets/cake-heart.jpg";
import mango from "@/assets/cake-mango.jpg";
import macarons from "@/assets/macarons.jpg";
import cupcake from "@/assets/cupcake.jpg";

export const CURRENCY = "TND";
export const formatPrice = (n: number) => `${n.toFixed(2)} ${CURRENCY}`;

export type Category = { slug: string; name: string };
export const categories: Category[] = [
  { slug: "cakes", name: "Cakes" },
  { slug: "pastries", name: "Pastries" },
  { slug: "macarons", name: "Macarons" },
  { slug: "cupcakes", name: "Cupcakes" },
];

export const occasions = ["Birthday", "Anniversary", "Wedding", "Kids", "Corporate"] as const;
export type Occasion = (typeof occasions)[number];

export type Product = {
  slug: string;
  name: string;
  category: string;
  occasions: Occasion[];
  price: number;
  image: string;
  description: string;
  rating: number;
  reviews: number;
  popularity: number;
  stock: number;
  tags: ("bestseller" | "trending" | "new")[];
  customizable: boolean;
};

export const products: Product[] = [
  { slug: "chocolate-bliss", name: "Chocolate Bliss Cake", category: "cakes", occasions: ["Birthday", "Corporate"], price: 95, image: chocolate, description: "Dark chocolate sponge, silky ganache drip and hand-piped chocolate rosettes.", rating: 4.8, reviews: 842, popularity: 98, stock: 12, tags: ["bestseller"], customizable: true },
  { slug: "strawberry-shortcake", name: "Strawberry Shortcake", category: "cakes", occasions: ["Birthday", "Anniversary"], price: 88, image: strawberry, description: "Light vanilla genoise layered with Chantilly cream and fresh strawberries.", rating: 4.9, reviews: 1126, popularity: 96, stock: 8, tags: ["bestseller", "trending"], customizable: true },
  { slug: "red-velvet-dream", name: "Red Velvet Dream", category: "cakes", occasions: ["Anniversary", "Wedding"], price: 92, image: redvelvet, description: "Velvety cocoa crumb with cream cheese frosting and a ring of rosettes.", rating: 4.7, reviews: 754, popularity: 90, stock: 5, tags: ["bestseller"], customizable: true },
  { slug: "mango-delight", name: "Mango Delight Cake", category: "cakes", occasions: ["Birthday", "Kids"], price: 85, image: mango, description: "Mango mousse cake with white chocolate drip and fresh mango cubes.", rating: 4.6, reviews: 532, popularity: 84, stock: 0, tags: ["bestseller", "new"], customizable: true },
  { slug: "vintage-heart", name: "Vintage Heart Cake", category: "cakes", occasions: ["Anniversary", "Wedding"], price: 78, image: heart, description: "Heart-shaped vanilla cake with retro piping and a candied cherry.", rating: 4.9, reviews: 410, popularity: 93, stock: 6, tags: ["trending", "new"], customizable: true },
  { slug: "macaron-box", name: "Parisian Macaron Box", category: "macarons", occasions: ["Corporate", "Anniversary"], price: 36, image: macarons, description: "Six macarons: raspberry, pistachio and Madagascar vanilla.", rating: 4.8, reviews: 620, popularity: 88, stock: 30, tags: ["trending"], customizable: false },
  { slug: "cherry-cupcake", name: "Cherry Blossom Cupcake", category: "cupcakes", occasions: ["Kids", "Birthday"], price: 9, image: cupcake, description: "Vanilla cupcake, strawberry buttercream swirl and sprinkles.", rating: 4.7, reviews: 298, popularity: 80, stock: 40, tags: ["trending", "new"], customizable: false },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);

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
