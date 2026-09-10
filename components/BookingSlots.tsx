"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";


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

  const [selectedSlot, setSelectedSlot] =
    useState<SelectedSlot | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [reason, setReason] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [bookingReference, setBookingReference] = useState("");
  const [emailWarning, setEmailWarning] = useState("");
  const [currentUnavailableSlots, setCurrentUnavailableSlots] =
  useState<UnavailableSlot[]>(unavailableSlots);

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

    setEmailWarning("");

const response = await fetch("/api/bookings", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    ownerId,
    customerName,
    customerEmail,
    bookingDate: selectedSlot.date,
    startTime: selectedSlot.time,
    reason: reason || null,
  }),
});

const result = await response.json();

if (!response.ok) {
  setErrorMessage(
    result.error || "Unable to create booking."
  );
  setLoading(false);
  return;
}

const referenceId = result.referenceId;

if (!result.emailSent) {
  setEmailWarning(
    "Your booking was created, but the confirmation email could not be sent."
  );
}

    setSuccessMessage("Booking request sent successfully.");

    if (referenceId) {
      setBookingReference(referenceId);
    }
    setCurrentUnavailableSlots((previousSlots) => {
  const alreadyUnavailable = previousSlots.some(
    (slot) =>
      slot.booking_date === selectedSlot.date &&
      slot.start_time.slice(0, 5) === selectedSlot.time
  );

  if (alreadyUnavailable) {
    return previousSlots;
  }

  return [
    ...previousSlots,
    {
      booking_date: selectedSlot.date,
      start_time: selectedSlot.time,
    },
  ];
});

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

        return (
          <div
            key={dateValue}
            className="booking-date-group"
          >
            <h3 className="booking-date-title">
              {displayDate}
            </h3>

            <div className="booking-time-grid">
              {times.map((time) => {
               const isUnavailable = currentUnavailableSlots.some(
  (slot) =>
    slot.booking_date === dateValue &&
    slot.start_time.slice(0, 5) === time
);

                const isSelected =
                  selectedSlot?.date === dateValue &&
                  selectedSlot?.time === time;

                return (
                  <button
                    key={`${dateValue}-${time}`}
                    type="button"
                    disabled={isUnavailable}
                    className={`booking-time-button ${
                      isSelected ? "selected" : ""
                    } ${
                      isUnavailable ? "unavailable" : ""
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
                    aria-disabled={isUnavailable}
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
{emailWarning && (
  <p className="booking-email-warning">
    {emailWarning}
  </p>
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