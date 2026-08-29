import BookingSlots from "@/components/BookingSlots";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";



export default async function BookingPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const supabase = await createClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, first_name, surname, username, business_title")
    .eq("username", username)
    .single();

  if (profileError || !profile) {
    notFound();
  }

  const { data: availability, error: availabilityError } = await supabase
    .from("availability")
    .select("id, day_of_week, start_time, end_time")
    .eq("owner_id", profile.id)
    .order("day_of_week")
    .order("start_time");

  return (
    <main>
      <h1>
        Book with {profile.first_name} {profile.surname}
      </h1>

      {profile.business_title && <p>{profile.business_title}</p>}

      <p>@{profile.username}</p>

      <h2>Available appointments</h2>

      {availabilityError && (
        <p>There was a problem loading availability.</p>
      )}

      {!availabilityError &&
        (!availability || availability.length === 0) && (
          <p>No availability has been added yet.</p>
        )}

      {availability && availability.length > 0 && (
  <BookingSlots
  availability={availability}
  ownerId={profile.id}
/>
)}
    </main>
  );
}