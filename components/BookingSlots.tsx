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
    <section className="booking-slots">
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
          <div
            key={dateValue}
            className="booking-date-group"
          >
            <h3 className="booking-date-title">
              {displayDate}
            </h3>

            <div className="booking-time-grid">
              {availableTimes.map((time) => {
                const isSelected =
                  selectedSlot?.date === dateValue &&
                  selectedSlot?.time === time;

                return (
                  <button
                    key={`${dateValue}-${time}`}
                    type="button"
                    className={`booking-time-button ${
                      isSelected ? "selected" : ""
                    }`}
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
        <div className="booking-request-card">
          <div className="booking-request-heading">
            <h3>Request this appointment</h3>

            <p>
              You selected{" "}
              <strong>
                {selectedSlot.displayDate} at {selectedSlot.time}
              </strong>
            </p>
          </div>

          <form
            onSubmit={handleBooking}
            className="booking-request-form"
          >
            <div className="booking-field">
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
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="booking-field">
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
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="booking-field">
              <label htmlFor="reason">
                Reason for booking
              </label>

              <textarea
                id="reason"
                value={reason}
                onChange={(event) =>
                  setReason(event.target.value)
                }
                placeholder="Tell the owner what you'd like to discuss..."
                rows={4}
              />
            </div>

            {errorMessage && (
              <p className="booking-form-error">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="booking-submit-button"
            >
              {loading
                ? "Sending request..."
                : "Request Booking"}
            </button>
          </form>
        </div>
      )}

      {successMessage && (
        <div className="booking-success-card">
          <div className="booking-success-icon">
            ✓
          </div>

          <div>
            <h3>{successMessage}</h3>

            {bookingReference && (
              <>
                <p>Your booking reference is:</p>

                <p className="booking-reference">
                  {bookingReference}
                </p>

                <Link
                  href={`/booking/${bookingReference}`}
                  className="booking-status-link"
                >
                  View booking status
                </Link>
              </>
            )}

            <p className="booking-success-note">
              Keep this reference safe. You can use it to check
              your booking status.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
