import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type CartItem = {
  key: string;
  slug: string;
  name: string;
  image: string;
  unitPrice: number;
  qty: number;
  options: string[];
  message?: string | undefined;
};

type Ctx = {
  items: CartItem[];
  add: (item: Omit<CartItem, "key" | "qty">, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  count: number;
  subtotal: number;
};

const CartContext = createContext<Ctx | null>(null);
const STORAGE = "maison-rose-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE, JSON.stringify(items));
  }, [items, ready]);

  const add: Ctx["add"] = (item, qty = 1) => {
    const key = `${item.slug}|${item.options.join(",")}|${item.message ?? ""}`;
    setItems((prev) => {
      const found = prev.find((i) => i.key === key);
      if (found) return prev.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i));
      return [...prev, { ...item, key, qty }];
    });
  };
  const setQty = (key: string, qty: number) =>
    setItems((prev) => (qty <= 0 ? prev.filter((i) => i.key !== key) : prev.map((i) => (i.key === key ? { ...i, qty } : i))));
  const remove = (key: string) => setItems((prev) => prev.filter((i) => i.key !== key));

  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);

  return <CartContext.Provider value={{ items, add, setQty, remove, count, subtotal }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
