"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const { data } = await supabase().auth.getSession();

        if (cancelled) return;

        if (!data.session) {
          router.replace("/login");
          return;
        }

        setChecking(false);
      } catch {
        if (!cancelled) {
          router.replace("/login");
        }
      }
    }

    checkSession();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (checking) {
    return (
      <div
        className="flex min-h-full flex-1 items-center justify-center font-mono"
        style={{ backgroundColor: "#0A0B0D", color: "#E8E6E1" }}
      >
        Chargement...
      </div>
    );
  }

  return <>{children}</>;
}
