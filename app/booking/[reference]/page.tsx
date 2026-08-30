import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CancelBookingForm from "@/components/CancelBookingForm";

export default async function BookingStatusPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;

  const supabase = await createClient();

  const { data: bookings, error } = await supabase.rpc(
    "get_booking_status",
    {
      p_reference_id: reference,
    }
  );

  if (error || !bookings || bookings.length === 0) {
    notFound();
  }

  const booking = bookings[0];

  const { data: owner } = await supabase
    .from("profiles")
    .select("first_name, surname, business_title")
    .eq("id", booking.owner_id)
    .single();

  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(
    new Date(`${booking.booking_date}T00:00:00`)
  );

  const canCancel =
    booking.status === "pending" ||
    booking.status === "accepted";

  return (
    <main>
      <h1>Booking status</h1>

      <p>
        Reference:{" "}
        <strong>{reference.toUpperCase()}</strong>
      </p>

      {owner && (
        <>
          <p>
            Booking with:{" "}
            <strong>
              {owner.first_name} {owner.surname}
            </strong>
          </p>

          {owner.business_title && (
            <p>{owner.business_title}</p>
          )}
        </>
      )}

      <p>
        Date: <strong>{formattedDate}</strong>
      </p>

      <p>
        Time:{" "}
        <strong>
          {booking.start_time.slice(0, 5)} -{" "}
          {booking.end_time.slice(0, 5)}
        </strong>
      </p>

      <p>
        Status: <strong>{booking.status}</strong>
      </p>

      {canCancel && (
        <CancelBookingForm
          reference={reference}
        />
      )}

      {booking.status === "cancelled" && (
        <p>
          <strong>This booking has been cancelled.</strong>
        </p>
      )}

      {booking.status === "rejected" && (
        <p>
          <strong>This booking was rejected.</strong>
        </p>
      )}
    </main>
  );
}