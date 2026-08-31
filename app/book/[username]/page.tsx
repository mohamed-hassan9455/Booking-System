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
    <main className="booking-page">
      <div className="booking-container">
        <section className="booking-header-card">
          <div className="booking-avatar">
            {profile.first_name.charAt(0)}
            {profile.surname.charAt(0)}
          </div>

          <div>
            <p className="booking-eyebrow">Book an appointment</p>

            <h1>
              {profile.first_name} {profile.surname}
            </h1>

            {profile.business_title && (
              <p className="booking-business-title">
                {profile.business_title}
              </p>
            )}

            <p className="booking-username">
              @{profile.username}
            </p>
          </div>
        </section>

        <section className="booking-main-card">
          <div className="booking-section-heading">
            <h2>Available appointments</h2>

            <p>
              Select a date and time that works for you.
            </p>
          </div>

          {availabilityError && (
            <p className="booking-error">
              There was a problem loading availability.
            </p>
          )}

          {!availabilityError &&
            (!availability || availability.length === 0) && (
              <p className="booking-empty">
                No availability has been added yet.
              </p>
            )}

          {availability && availability.length > 0 && (
            <BookingSlots
              availability={availability}
              ownerId={profile.id}
              unavailableSlots={
                unavailableError
                  ? []
                  : unavailableSlots ?? []
              }
            />
          )}
        </section>
      </div>
    </main>
  );
}