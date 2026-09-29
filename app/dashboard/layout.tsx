import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";


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
        <p className="dashboard-brand">Booking System</p>
        <p className="dashboard-brand-subtitle">Owner dashboard</p>
      </div>

      <LogoutButton />
    </header>

    {children}
  </div>
);
}