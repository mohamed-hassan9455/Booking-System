"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type CancelBookingFormProps = {
  reference: string;
};

export default function CancelBookingForm({
  reference,
}: CancelBookingFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleCancel(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const { data, error } = await supabase.rpc(
      "cancel_booking_request",
      {
        p_reference_id: reference,
        p_customer_email: email,
      }
    );

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    if (!data) {
      setErrorMessage(
        "Unable to cancel booking. Check that the email is correct."
      );
      setLoading(false);
      return;
    }

    setSuccessMessage("Booking cancelled successfully.");
    setLoading(false);

    router.refresh();
  }

  return (
    <section className="cancel-booking-card">
      <div className="cancel-booking-heading">
        <h2>Cancel booking</h2>

        <p>
          Enter the email address used when making this booking.
        </p>
      </div>

      <form
        onSubmit={handleCancel}
        className="cancel-booking-form"
      >
        <div className="booking-field">
          <label htmlFor="cancelEmail">Email</label>

          <input
            id="cancelEmail"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder="you@example.com"
            required
          />
        </div>

        {errorMessage && (
          <p className="booking-form-error">
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <p className="cancel-success">
            {successMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="cancel-booking-button"
        >
          {loading ? "Cancelling..." : "Cancel booking"}
        </button>
      </form>
    </section>
  );
}