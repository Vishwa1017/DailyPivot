"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AppPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error(error);
        router.push("/login");
        return;
      }

      if (!data.session) {
        router.push("/login");
        return;
      }

      setEmail(data.session.user.email ?? null);
    };

    run();
  }, [router]);

  return (
    <>
      <div style={{ padding: 24 }}>
        <h1>Daily Pivot</h1>
        <p>{email ? `Logged in as: ${email}` : "Checking session..."}</p>
      </div>

      <div>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.push("/login");
          }}
          style={{ marginTop: 12 }}>
          Logout
        </button>
      </div>
    </>
  );
}
