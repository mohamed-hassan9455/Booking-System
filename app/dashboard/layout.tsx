import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import LogoutButton from "@/components/LogoutButton";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/login");
  }

  return (
    <div className="dashboard-shell">
      <header className="dashboard-topbar">
        <div>
          <p className="dashboard-brand">Bookly</p>
          <p className="dashboard-brand-subtitle">Owner dashboard</p>
        </div>

        <LogoutButton />
      </header>

      {children}
    </div>
  );
}
