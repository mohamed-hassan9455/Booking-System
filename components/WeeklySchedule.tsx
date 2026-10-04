"use client";

import { Fragment } from "react";

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

const HOURS = Array.from({ length: 12 }, (_, index) => index + 8);

function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function dateToString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getWeekDates() {
  const today = new Date();
  const currentDay = today.getDay();

  const monday = new Date(today);
  monday.setDate(today.getDate() - ((currentDay + 6) % 7));

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);

    return {
      date,
      dayOfWeek: date.getDay(),
      dateStr: dateToString(date),
      label: date.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }),
    };
  });
}

export default function WeeklySchedule({
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
      (item) =>
        item.booking_date === dateStr &&
        toMinutes(item.start_time) <= hourStart &&
        toMinutes(item.end_time) > hourStart,
    );

    if (booking) {
      return {
        type: booking.status === "pending" ? "pending" : "accepted",
        booking,
      } as const;
    }
    const [year, month, day] = dateStr.split("-").map(Number);

    const slotStart = new Date(year, month - 1, day, hour, 0, 0);

    if (slotStart < new Date()) {
      return {
        type: "past" as const,
      };
    }

    const isAvailable = availability.some(
      (item) =>
        item.day_of_week === dayOfWeek &&
        toMinutes(item.start_time) <= hourStart &&
        toMinutes(item.end_time) > hourStart,
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
          style={{ gridTemplateColumns: "72px repeat(7, 1fr)" }}
        >
          <div className="schedule-corner" />

          {weekDates.map((day) => (
            <div key={day.dateStr} className="schedule-day-label">
              {day.label}
            </div>
          ))}

          {HOURS.map((hour) => (
            <Fragment key={hour}>
              <div className="schedule-time-label">{hour}:00</div>

              {weekDates.map((day) => {
                const cell = getCell(day.dayOfWeek, day.dateStr, hour);

                return (
                  <div
                    key={`${day.dateStr}-${hour}`}
                    className={`schedule-cell schedule-cell-${cell.type}`}
                  >
                    {(cell.type === "pending" || cell.type === "accepted") && (
                      <span className="schedule-cell-name">
                        {cell.booking.customer_name}
                      </span>
                    )}

                    {cell.type === "available" && <span>Free</span>}
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>

      <div className="schedule-legend">
        <span>
          <i className="legend-dot legend-available" />
          Available
        </span>

        <span>
          <i className="legend-dot legend-pending" />
          Pending
        </span>

        <span>
          <i className="legend-dot legend-accepted" />
          Accepted
        </span>

        <span>
          <i className="legend-dot legend-closed" />
          Not set
        </span>

        <span>
          <i className="legend-dot legend-past" />
          Past
        </span>
      </div>
    </section>
  );
}
