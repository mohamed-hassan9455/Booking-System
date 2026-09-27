import { createClient } from "@/lib/supabase/server";
import OwnerDashboard from "@/components/OwnerDashboard";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, first_name, username")
    .eq("id", user!.id)
    .single();

  return <OwnerDashboard ownerId={profile!.id} firstName={profile!.first_name} />;
}