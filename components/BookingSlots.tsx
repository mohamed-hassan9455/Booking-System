"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Availability = {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

type UnavailableSlot = {
  booking_date: string;
  start_time: string;
};

type BookingSlotsProps = {
  availability: Availability[];
  ownerId: string;
  unavailableSlots: UnavailableSlot[];
};

type SelectedSlot = {
  date: string;
  displayDate: string;
  time: string;
};

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
}

function createHourlySlots(startTime: string, endTime: string) {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  const slots: string[] = [];

  for (
    let current = startMinutes;
    current + 60 <= endMinutes;
    current += 60
  ) {
    slots.push(minutesToTime(current));
  }

  return slots;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

function dateToString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function BookingSlots({
  availability,
  ownerId,
  unavailableSlots,
}: BookingSlotsProps) {
  const supabase = createClient();

  const [selectedSlot, setSelectedSlot] =
    useState<SelectedSlot | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [reason, setReason] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [bookingReference, setBookingReference] = useState("");

  const upcomingDates = useMemo(() => {
    const dates: Date[] = [];
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 14; i++) {
      const date = new Date(today);

      date.setDate(today.getDate() + i);

      dates.push(date);
    }

    return dates;
  }, []);

  async function handleBooking(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!selectedSlot) {
      setErrorMessage("Please select an appointment time.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    setBookingReference("");

    const { data: referenceId, error } = await supabase.rpc(
      "create_booking_request",
      {
        p_owner_id: ownerId,
        p_customer_name: customerName,
        p_customer_email: customerEmail,
        p_booking_date: selectedSlot.date,
        p_start_time: selectedSlot.time,
        p_reason: reason || null,
      }
    );

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setSuccessMessage("Booking request sent successfully.");

    if (referenceId) {
      setBookingReference(referenceId);
    }

    setCustomerName("");
    setCustomerEmail("");
    setReason("");
    setSelectedSlot(null);
    setLoading(false);
  }

  return (
    <section>
      {upcomingDates.map((date) => {
        const matchingAvailability = availability.filter(
          (range) => range.day_of_week === date.getDay()
        );

        if (matchingAvailability.length === 0) {
          return null;
        }

        const times = Array.from(
          new Set(
            matchingAvailability.flatMap((range) =>
              createHourlySlots(
                range.start_time,
                range.end_time
              )
            )
          )
        ).sort();

        const dateValue = dateToString(date);
        const displayDate = formatDate(date);

        const availableTimes = times.filter((time) => {
          return !unavailableSlots.some(
            (slot) =>
              slot.booking_date === dateValue &&
              slot.start_time.slice(0, 5) === time
          );
        });

        if (availableTimes.length === 0) {
          return null;
        }

        return (
          <div key={dateValue}>
            <h3>{displayDate}</h3>

            <div>
              {availableTimes.map((time) => {
                const isSelected =
                  selectedSlot?.date === dateValue &&
                  selectedSlot?.time === time;

                return (
                  <button
                    key={`${dateValue}-${time}`}
                    type="button"
                    onClick={() => {
                      setSelectedSlot({
                        date: dateValue,
                        displayDate,
                        time,
                      });

                      setErrorMessage("");
                      setSuccessMessage("");
                      setBookingReference("");
                    }}
                    aria-pressed={isSelected}
                  >
                    {isSelected ? `✓ ${time}` : time}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {selectedSlot && (
        <>
          <h3>Request this appointment</h3>

          <p>
            <strong>
              {selectedSlot.displayDate} at{" "}
              {selectedSlot.time}
            </strong>
          </p>

          <form onSubmit={handleBooking}>
            <div>
              <label htmlFor="customerName">
                Full name
              </label>

              <input
                id="customerName"
                type="text"
                value={customerName}
                onChange={(event) =>
                  setCustomerName(event.target.value)
                }
                required
              />
            </div>

            <div>
              <label htmlFor="customerEmail">
                Email
              </label>

              <input
                id="customerEmail"
                type="email"
                value={customerEmail}
                onChange={(event) =>
                  setCustomerEmail(event.target.value)
                }
                required
              />
            </div>

            <div>
              <label htmlFor="reason">
                Reason for booking
              </label>

              <textarea
                id="reason"
                value={reason}
                onChange={(event) =>
                  setReason(event.target.value)
                }
              />
            </div>

            {errorMessage && (
              <p>{errorMessage}</p>
            )}

            <button type="submit" disabled={loading}>
              {loading
                ? "Sending request..."
                : "Request Booking"}
            </button>
          </form>
        </>
      )}

      {successMessage && (
  <div>
    <p>
      <strong>{successMessage}</strong>
    </p>

    {bookingReference && (
      <>
        <p>
          Your booking reference is:{" "}
          <strong>{bookingReference}</strong>
        </p>

        <p>
          <Link href={`/booking/${bookingReference}`}>
            View booking status
          </Link>
        </p>
      </>
    )}

    <p>
      Keep this reference safe. You can use it to check your
      booking status.
    </p>
  </div>
)}
    </section>
  );
}