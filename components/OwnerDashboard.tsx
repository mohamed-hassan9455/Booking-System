"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AvailabilityGrid from "../app/Owner Dashboard/AvailabilityGrid";
import BookingsList from "../app/Owner Dashboard/BookingsList";
import WeeklySchedule from "./WeeklySchedule";

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

export default function OwnerDashboard({
  ownerId,
  firstName,
}: {
  ownerId: string;
  firstName: string;
}) {
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  function handleBookingStatusChange(
    id: string,
    status: "accepted" | "rejected",
  ) {
    setBookings((currentBookings) => {
      if (status === "rejected") {
        return currentBookings.filter((booking) => booking.id !== id);
      }

      return currentBookings.map((booking) =>
        booking.id === id ? { ...booking, status } : booking,
      );
    });
  }

  useEffect(() => {
    const supabase = createClient();
    async function loadData() {
      const { data: availabilityData } = await supabase
        .from("availability")
        .select("*")
        .eq("owner_id", ownerId);

      const now = new Date();

      const today = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0"),
      ].join("-");

      const { data: bookingsData } = await supabase
        .from("bookings")
        .select("*")
        .eq("owner_id", ownerId)
        .in("status", ["pending", "accepted"])
        .gte("booking_date", today)
        .order("booking_date", { ascending: true })
        .order("start_time", { ascending: true });

      setAvailability(availabilityData ?? []);
      setBookings(bookingsData ?? []);
      setLoading(false);
    }

    loadData();

    const channel = supabase
      .channel("dashboard-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "availability",
          filter: `owner_id=eq.${ownerId}`,
        },
        () => loadData(),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
          filter: `owner_id=eq.${ownerId}`,
        },
        () => loadData(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ownerId]);

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <main className="dashboard-page">
      <h1>Welcome, {firstName}</h1>

      <WeeklySchedule availability={availability} bookings={bookings} />

      <AvailabilityGrid ownerId={ownerId} availability={availability} />

      <BookingsList
        bookings={bookings}
        onStatusChange={handleBookingStatusChange}
      />
    </main>
  );
}
