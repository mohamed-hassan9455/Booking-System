import BookingSlots from "@/components/BookingSlots";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function dateToString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endDate = new Date(today);
  endDate.setDate(today.getDate() + 13);

  const { data: unavailableSlots, error: unavailableError } =
    await supabase.rpc("get_unavailable_booking_slots", {
      p_owner_id: profile.id,
      p_start_date: dateToString(today),
      p_end_date: dateToString(endDate),
    });

  return (
    <main>
      <h1>
        Book with {profile.first_name} {profile.surname}
      </h1>

      {profile.business_title && (
        <p>{profile.business_title}</p>
      )}

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
          unavailableSlots={
            unavailableError ? [] : unavailableSlots ?? []
          }
        />
      )}
    </main>
  );
}