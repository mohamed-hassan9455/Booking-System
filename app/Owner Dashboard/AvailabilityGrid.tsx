"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Availability = {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function AvailabilityGrid({
  ownerId,
  availability,
}: {
  ownerId: string;
  availability: Availability[];
}) {
  const supabase = createClient();

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleAdd() {
    setErrorMessage("");

    if (selectedDay === null) return;

    if (startTime >= endTime) {
      setErrorMessage("Start time must be before end time.");
      return;
    }

    const { error } = await supabase.from("availability").insert({
      owner_id: ownerId,
      day_of_week: selectedDay,
      start_time: startTime,
      end_time: endTime,
    });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSelectedDay(null);
  }

  async function handleRemove(id: string) {
    await supabase.from("availability").delete().eq("id", id);
  }

  return (
    <section className="availability-section">
      <h2>Your availability</h2>

      <div className="availability-days">
        {DAYS.map((dayName, index) => {
          const dayAvailability = availability.filter(
            (a) => a.day_of_week === index
          );

          return (
            <div key={index} className="availability-day-row">
              <div className="availability-day-header">
                <strong>{dayName}</strong>
                <button onClick={() => setSelectedDay(index)}>
                  + Add time range
                </button>
              </div>

              <div className="availability-slots">
                {dayAvailability.length === 0 && (
                  <p className="availability-empty">No availability set</p>
                )}

                {dayAvailability.map((slot) => (
                  <div key={slot.id} className="availability-slot">
                    <span>
                      {slot.start_time.slice(0, 5)} -{" "}
                      {slot.end_time.slice(0, 5)}
                    </span>
                    <button onClick={() => handleRemove(slot.id)}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {selectedDay === index && (
                <div className="availability-form">
                  <label>
                    Start time
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </label>

                  <label>
                    End time
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </label>

                  {errorMessage && (
                    <p className="auth-error">{errorMessage}</p>
                  )}

                  <div className="availability-form-buttons">
                    <button onClick={handleAdd}>Save</button>
                    <button onClick={() => setSelectedDay(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}