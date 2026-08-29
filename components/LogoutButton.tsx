"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error logging out:", error.message);
      return;
    }

    router.push("/login");
    router.refresh();
  }

  return (
    <button type="button" onClick={handleLogout}>
      Log out
    </button>
  );
}