"use client";

import React from "react";

type Availability = {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

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

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8:00 to 19:00

function toMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function getWeekDates() {
  const today = new Date();
  const currentDay = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((currentDay + 6) % 7));

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return {
      date,
      dayOfWeek: date.getDay(),
      dateStr: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }),
    };
  });
}

export default function AvailabilityGrid({
  availability,
  bookings,
}: {
  availability: Availability[];
  bookings: Booking[];
}) {
  const weekDates = getWeekDates();

  function getCell(dayOfWeek: number, dateStr: string, hour: number) {
    const hourStart = hour * 60;

    const booking = bookings.find(
      (b) =>
        b.booking_date === dateStr &&
        toMinutes(b.start_time) <= hourStart &&
        toMinutes(b.end_time) > hourStart
    );

    if (booking) {
      return { type: "booked" as const, booking };
    }

    const isAvailable = availability.some(
      (a) =>
        a.day_of_week === dayOfWeek &&
        toMinutes(a.start_time) <= hourStart &&
        toMinutes(a.end_time) > hourStart
    );

    return {
      type: isAvailable ? ("available" as const) : ("closed" as const),
    };
  }

  return (
    <section className="schedule-section">
      <h2>This week's schedule</h2>

      <div className="schedule-grid-wrapper">
        <div
          className="schedule-grid"
          style={{ gridTemplateColumns: `72px repeat(7, 1fr)` }}
        >
          <div className="schedule-corner" />

          {weekDates.map((d) => (
            <div key={d.dateStr} className="schedule-day-label">
              {d.label}
            </div>
          ))}

          {HOURS.map((hour) => (
            <React.Fragment key={hour}>
              <div className="schedule-time-label">{hour}:00</div>

              {weekDates.map((d) => {
                const cell = getCell(d.dayOfWeek, d.dateStr, hour);

                return (
                  <div
                    key={`${d.dateStr}-${hour}`}
                    className={`schedule-cell schedule-cell-${cell.type}`}
                  >
                    {cell.type === "booked" && (
                      <span className="schedule-cell-name">
                        {cell.booking!.customer_name}
                      </span>
                    )}
                    {cell.type === "available" && <span>Free</span>}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="schedule-legend">
        <span>
          <i className="legend-dot legend-available" /> Available
        </span>
        <span>
          <i className="legend-dot legend-booked" /> Booked
        </span>
        <span>
          <i className="legend-dot legend-closed" /> Not set
        </span>
      </div>
    </section>
  );
}