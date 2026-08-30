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
    <section>
      <h2>Cancel booking</h2>

      <p>
        Enter the email address used when making this booking.
      </p>

      <form onSubmit={handleCancel}>
        <div>
          <label htmlFor="cancelEmail">Email</label>

          <input
            id="cancelEmail"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            required
          />
        </div>

        {errorMessage && (
          <p>{errorMessage}</p>
        )}

        {successMessage && (
          <p>
            <strong>{successMessage}</strong>
          </p>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Cancelling..." : "Cancel booking"}
        </button>
      </form>
    </section>
  );
}