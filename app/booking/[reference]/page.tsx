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
    <main className="booking-status-page">
      <div className="booking-status-container">
        <section className="booking-status-card">
          <div className="booking-status-heading">
            <p className="booking-eyebrow">Booking details</p>

            <h1>Booking status</h1>

            <p className="booking-status-reference">
              Reference:{" "}
              <strong>{reference.toUpperCase()}</strong>
            </p>
          </div>

          <div className="booking-status-details">
            {owner && (
              <div className="booking-status-row">
                <span>Booking with</span>

                <strong>
                  {owner.first_name} {owner.surname}
                </strong>
              </div>
            )}

            {owner?.business_title && (
              <div className="booking-status-row">
                <span>Business / role</span>

                <strong>{owner.business_title}</strong>
              </div>
            )}

            <div className="booking-status-row">
              <span>Date</span>

              <strong>{formattedDate}</strong>
            </div>

            <div className="booking-status-row">
              <span>Time</span>

              <strong>
                {booking.start_time.slice(0, 5)} -{" "}
                {booking.end_time.slice(0, 5)}
              </strong>
            </div>

            <div className="booking-status-row">
              <span>Status</span>

              <span
                className={`booking-status-badge status-${booking.status}`}
              >
                {booking.status}
              </span>
            </div>
          </div>

          {booking.status === "cancelled" && (
            <div className="booking-status-message">
              This booking has been cancelled.
            </div>
          )}

          {booking.status === "rejected" && (
            <div className="booking-status-message booking-status-message-error">
              This booking was rejected.
            </div>
          )}
        </section>

        {canCancel && (
          <CancelBookingForm reference={reference} />
        )}
      </div>
    </main>
  );
}