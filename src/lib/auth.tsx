import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type Ctx = { user: User | null; roles: string[]; loading: boolean; isAdmin: boolean; isStaff: boolean };
const AuthContext = createContext<Ctx>({ user: null, roles: [], loading: true, isAdmin: false, isStaff: false });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async (u: User | null) => {
      setUser(u);
      if (u) {
        const { data } = await supabase.from("user_roles").select("role").eq("user_id", u.id);
        setRoles((data ?? []).map((r) => r.role));
      } else setRoles([]);
      setLoading(false);
    };
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED" || event === "INITIAL_SESSION") {
        setTimeout(() => void load(session?.user ?? null), 0);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const isAdmin = roles.includes("admin");
  return <AuthContext.Provider value={{ user, roles, loading, isAdmin, isStaff: isAdmin || roles.includes("staff") }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
