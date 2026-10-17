"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { SessionProfile } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  profile: SessionProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

async function fetchProfile(
  supabase: ReturnType<typeof createClient>,
  user: User,
): Promise<SessionProfile> {
  const { data: student } = await supabase
    .from("students")
    .select("id, first_name, last_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (student) {
    return {
      userId: user.id,
      role: "student",
      displayName:
        [student.first_name, student.last_name].filter(Boolean).join(" ") ||
        "לומד",
      avatarUrl: student.avatar_url,
    };
  }

  const { data: teacher } = await supabase
    .from("teachers")
    .select("id, display_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (teacher) {
    return {
      userId: user.id,
      role: "teacher",
      displayName: teacher.display_name ?? "מורה",
      avatarUrl: teacher.avatar_url,
    };
  }

  return {
    userId: user.id,
    role: "student",
    displayName: user.email ?? "משתמש SkillUp",
    avatarUrl: null,
  };
}

export default function AuthProvider({
  initialProfile,
  children,
}: {
  initialProfile: SessionProfile | null;
  children: React.ReactNode;
}) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<SessionProfile | null>(initialProfile);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const {
      data: { user: current },
    } = await supabase.auth.getUser();
    setUser(current);
    setProfile(current ? await fetchProfile(supabase, current) : null);
  }, [supabase]);

  useEffect(() => {
    let cancelled = false;

    supabase.auth.getUser().then(async ({ data: { user: current } }) => {
      if (cancelled) return;
      setUser(current);
      if (current && (!initialProfile || initialProfile.userId !== current.id)) {
        setProfile(await fetchProfile(supabase, current));
      } else if (!current) {
        setProfile(null);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        refreshProfile().then(() => router.refresh());
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase, initialProfile, refreshProfile, router]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    router.refresh();
  }, [supabase, router]);

  const value = useMemo(
    () => ({ user, profile, loading, signOut, refreshProfile }),
    [user, profile, loading, signOut, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
