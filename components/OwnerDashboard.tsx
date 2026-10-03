"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AvailabilityGrid from "./AvailabilityGrid";
import AvailabilitySettings from "./AvailabilitySettings";
import BookingsList from "./BookingsList";
import LogoutButton from "./LogoutButton";

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
  const supabase = createClient();

  const [availability, setAvailability] = useState<Availability[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: availabilityData } = await supabase
        .from("availability")
        .select("*")
        .eq("owner_id", ownerId);

      const { data: bookingsData } = await supabase
        .from("bookings")
        .select("*")
        .eq("owner_id", ownerId)
        .in("status", ["pending", "accepted"]);

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
        () => loadData()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
          filter: `owner_id=eq.${ownerId}`,
        },
        () => loadData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ownerId]);

  return (
    <div className="dashboard-shell">
      <header className="dashboard-nav">
        <div className="dashboard-nav-inner">
          <span className="dashboard-logo">Bookly</span>

          <div className="dashboard-nav-right">
            <span className="dashboard-nav-name">{firstName}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="dashboard-page">
        {loading ? (
          <p className="dashboard-loading">Loading dashboard…</p>
        ) : (
          <>
            <div className="dashboard-intro">
              <h1>Welcome back, {firstName}</h1>
              <p>Here's what's happening with your bookings this week.</p>
            </div>

            <AvailabilityGrid availability={availability} bookings={bookings} />
            <AvailabilitySettings ownerId={ownerId} availability={availability} />
            <BookingsList bookings={bookings} />
          </>
        )}
      </main>
    </div>
  );
}