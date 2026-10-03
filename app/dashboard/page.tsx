import { redirect } from "next/navigation";
import OwnerDashboard from "@/components/OwnerDashboard";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, first_name, username")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return (
      <main className="dashboard-page">
        <p>We couldn't load your owner profile. Please try again.</p>
      </main>
    );
  }

  return <OwnerDashboard ownerId={profile.id} firstName={profile.first_name} />;
}
