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
  const [successMessage, setSuccessMessage] = useState("");

  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  function openForm(day: number) {
    setSelectedDay(day);
    setErrorMessage("");
    setSuccessMessage("");
  }

  async function handleAdd() {
    setErrorMessage("");
    setSuccessMessage("");

    if (selectedDay === null) {
      return;
    }

    if (startTime >= endTime) {
      setErrorMessage("Start time must be before end time.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("availability").insert({
      owner_id: ownerId,
      day_of_week: selectedDay,
      start_time: startTime,
      end_time: endTime,
    });

    if (error) {
      console.warn("Failed to add availability:", error.message);

      if (error.code === "23505") {
        setErrorMessage("That availability range already exists for this day.");
      } else {
        setErrorMessage("Could not save availability. Please try again.");
      }

      setSaving(false);
      return;
    }

    setSuccessMessage("Availability added successfully.");
    setSaving(false);
    setSelectedDay(null);
  }

  async function handleRemove(id: string) {
    setErrorMessage("");
    setSuccessMessage("");
    setRemovingId(id);

    const { error } = await supabase.from("availability").delete().eq("id", id);

    if (error) {
      console.warn("Failed to remove availability:", error.message);
      setErrorMessage("Could not remove availability. Please try again.");

      setRemovingId(null);
      return;
    }

    setSuccessMessage("Availability removed successfully.");
    setRemovingId(null);
  }

  return (
    <section className="availability-section">
      <h2>Your availability</h2>

      {errorMessage && (
        <p className="auth-error" role="alert">
          {errorMessage}
        </p>
      )}

      {successMessage && (
        <output className="dashboard-success">{successMessage}</output>
      )}

      <div className="availability-days">
        {DAYS.map((dayName, index) => {
          const dayAvailability = availability.filter(
            (a) => a.day_of_week === index,
          );

          return (
            <div key={dayName} className="availability-day-row">
              <div className="availability-day-header">
                <strong>{dayName}</strong>

                <button
                  type="button"
                  onClick={() => openForm(index)}
                  disabled={saving}
                >
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

                    <button
                      type="button"
                      onClick={() => handleRemove(slot.id)}
                      disabled={removingId === slot.id}
                    >
                      {removingId === slot.id ? "Removing..." : "Remove"}
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
                      disabled={saving}
                    />
                  </label>

                  <label>
                    End time
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      disabled={saving}
                    />
                  </label>

                  <div className="availability-form-buttons">
                    <button type="button" onClick={handleAdd} disabled={saving}>
                      {saving ? "Saving..." : "Save"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDay(null);
                        setErrorMessage("");
                      }}
                      disabled={saving}
                    >
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
