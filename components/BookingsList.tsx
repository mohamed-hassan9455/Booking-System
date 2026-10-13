"use client";

import { useState } from "react";
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

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function updateBookingStatus(
    id: string,
    status: "accepted" | "rejected"
  ) {
    setErrorMessage("");
    setSuccessMessage("");
    setProcessingId(id);

    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", id);

    if (error) {
      console.warn(`Failed to ${status} booking:`, error.message);

      setErrorMessage(
        `Could not ${
          status === "accepted" ? "accept" : "reject"
        } the booking. Please try again.`
      );

      setProcessingId(null);
      return;
    }

    setSuccessMessage(
      `Booking ${
        status === "accepted" ? "accepted" : "rejected"
      } successfully.`
    );

    setProcessingId(null);
  }

  const pending = bookings.filter((b) => b.status === "pending");
  const accepted = bookings.filter((b) => b.status === "accepted");

  return (
    <section className="bookings-section">
      <h2>Booking requests</h2>

      {errorMessage && (
        <p className="auth-error" role="alert">
          {errorMessage}
        </p>
      )}

      {successMessage && (
        <p className="dashboard-success" role="status">
          {successMessage}
        </p>
      )}

      {bookings.length === 0 && <p>No booking requests yet.</p>}

      {[...pending, ...accepted].map((booking) => {
        const isProcessing = processingId === booking.id;

        return (
          <div
            key={booking.id}
            className={`booking-card status-${booking.status}`}
          >
            <div className="booking-card-header">
              <strong>{booking.customer_name}</strong>

              <span
                className={`booking-status-badge status-${booking.status}`}
              >
                {booking.status}
              </span>
            </div>

            <p>{booking.customer_email}</p>

            <p>
              {booking.booking_date} — {booking.start_time.slice(0, 5)} to{" "}
              {booking.end_time.slice(0, 5)}
            </p>

            {booking.reason && <p>Reason: {booking.reason}</p>}

            <p className="booking-reference">
              Ref: {booking.reference_id}
            </p>

            {booking.status === "pending" && (
              <div className="booking-card-buttons">
                <button
                  onClick={() =>
                    updateBookingStatus(booking.id, "accepted")
                  }
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "Accept"}
                </button>

                <button
                  onClick={() =>
                    updateBookingStatus(booking.id, "rejected")
                  }
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "Reject"}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}