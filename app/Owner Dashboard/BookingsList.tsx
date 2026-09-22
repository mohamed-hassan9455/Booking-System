"use client";

import { createClient } from "@/lib/supabase/client";

type Booking = {
  id: string;
  reference_id: string;
  customer_name: string;
  customer_email: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  reason: string | null;
  status: string;
};

export default function BookingsList({ bookings }: { bookings: Booking[] }) {
  const supabase = createClient();

  async function handleAccept(id: string) {
    await supabase.from("bookings").update({ status: "accepted" }).eq("id", id);
  }

  async function handleReject(id: string) {
    await supabase.from("bookings").update({ status: "rejected" }).eq("id", id);
  }

  const pending = bookings.filter((b) => b.status === "pending");
  const accepted = bookings.filter((b) => b.status === "accepted");

  return (
    <section className="bookings-section">
      <h2>Booking requests</h2>

      {bookings.length === 0 && <p>No booking requests yet.</p>}

      {[...pending, ...accepted].map((booking) => (
        <div
          key={booking.id}
          className={`booking-card status-${booking.status}`}
        >
          <div className="booking-card-header">
            <strong>{booking.customer_name}</strong>
            <span className={`booking-status-badge status-${booking.status}`}>
              {booking.status}
            </span>
          </div>

          <p>{booking.customer_email}</p>

          <p>
            {booking.booking_date} — {booking.start_time.slice(0, 5)} to{" "}
            {booking.end_time.slice(0, 5)}
          </p>

          {booking.reason && <p>Reason: {booking.reason}</p>}

          <p className="booking-reference">Ref: {booking.reference_id}</p>

          {booking.status === "pending" && (
            <div className="booking-card-buttons">
              <button onClick={() => handleAccept(booking.id)}>Accept</button>
              <button onClick={() => handleReject(booking.id)}>Reject</button>
            </div>
          )}
        </div>
      ))}
    </section>
  );
}